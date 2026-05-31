import re
from datetime import datetime, date
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.field_config import FormFieldConfig

async def validate_form_data(
    db: AsyncSession,
    visa_type_id: uuid.UUID,
    applicant_nationality: str,
    form_data: dict
) -> tuple[bool, dict[str, str]]:
    """
    Validates form data against dynamic FormFieldConfig defined for the visa type and nationality.
    """
    # 1. Fetch form field configurations
    result = await db.execute(
        select(FormFieldConfig).where(
            FormFieldConfig.visa_type_id == visa_type_id,
            FormFieldConfig.applicant_nationality.in_(['ALL', applicant_nationality])
        )
    )
    configs = result.scalars().all()

    errors = {}
    parsed_dates = {}

    for config in configs:
        field_name = config.field_name
        is_required = config.is_required
        field_type = config.field_type
        options = config.options
        validation_regex = config.validation_regex

        val = form_data.get(field_name)

        # Check required fields
        if is_required:
            if val is None or (isinstance(val, str) and not val.strip()):
                errors[field_name] = f"Field '{config.field_label}' is required."
                continue
        else:
            if val is None or (isinstance(val, str) and not val.strip()):
                # Skip validation for non-required empty fields
                continue

        # Validate field types
        if field_type == 'text':
            if not isinstance(val, str):
                errors[field_name] = f"Field '{config.field_label}' must be text."
                continue
        elif field_type == 'number':
            try:
                float(val)
            except (ValueError, TypeError):
                errors[field_name] = f"Field '{config.field_label}' must be a number."
                continue
        elif field_type == 'boolean':
            if not isinstance(val, bool):
                # Try to parse string representation if any
                if str(val).lower() in ['true', '1']:
                    form_data[field_name] = True
                elif str(val).lower() in ['false', '0']:
                    form_data[field_name] = False
                else:
                    errors[field_name] = f"Field '{config.field_label}' must be a boolean."
                    continue
        elif field_type == 'dropdown':
            # Check value is in options list
            valid = False
            if isinstance(options, list):
                if len(options) == 0:
                    # If options list is empty in DB, allow any value (like frontend defaults)
                    valid = True
                else:
                    valid_options = []
                    for opt in options:
                        if isinstance(opt, dict):
                            valid_options.append(opt.get("value"))
                        else:
                            valid_options.append(opt)
                    if val in valid_options or str(val) in [str(x) for x in valid_options]:
                        valid = True
            else:
                # If no options list is configured, allow any value
                valid = True
            if not valid:
                errors[field_name] = f"Field '{config.field_label}' has an invalid option."
                continue
        elif field_type == 'date':
            # Validate date format YYYY-MM-DD
            try:
                if isinstance(val, str):
                    parsed_date = datetime.strptime(val, "%Y-%m-%d").date()
                elif isinstance(val, (datetime, date)):
                    parsed_date = val.date() if isinstance(val, datetime) else val
                else:
                    raise ValueError
                parsed_dates[field_name] = parsed_date
            except (ValueError, TypeError):
                errors[field_name] = f"Field '{config.field_label}' must be a valid date in YYYY-MM-DD format."
                continue

            # Specific date validations (future travel date)
            if field_name == 'travel_date':
                if parsed_date <= date.today():
                    errors[field_name] = "Travel date must be in the future."

        # Check validation_regex if it exists
        if validation_regex and isinstance(val, str):
            try:
                if not re.match(validation_regex, val):
                    errors[field_name] = f"Field '{config.field_label}' does not match required format."
            except Exception:
                # Fallback in case of regex compile errors or invalid patterns
                pass

    # Cross-field validations
    # 1. return_date must be after travel_date
    if 'travel_date' in parsed_dates and 'return_date' in parsed_dates:
        if parsed_dates['return_date'] <= parsed_dates['travel_date']:
            errors['return_date'] = "Return date must be after travel date."

    # 2. passport_expiry must be after return_date
    if 'passport_expiry' in parsed_dates and 'return_date' in parsed_dates:
        if parsed_dates['passport_expiry'] <= parsed_dates['return_date']:
            errors['passport_expiry'] = "Passport expiry must be after return date."

    # 3. date_of_birth must be in the past
    if 'date_of_birth' in parsed_dates:
        if parsed_dates['date_of_birth'] >= date.today():
            errors['date_of_birth'] = "Date of birth must be in the past."

    return len(errors) == 0, errors
