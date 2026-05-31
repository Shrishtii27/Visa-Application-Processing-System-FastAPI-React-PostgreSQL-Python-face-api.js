import uuid
import os
import difflib
from datetime import datetime, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.document import UploadedDocument
from app.models.visa_type import VisaType
from app.models.requirement import VisaRequirement
from app.models.enums import DocumentType, DocumentStatus
from app.services.ocr.bank_statement_ocr import BankStatementOCR

# Mapping of country codes to required months of bank history
COUNTRY_REQUIRED_MONTHS = {
    "AE": 6, "ARE": 6,
    "GB": 6, "GBR": 6,
    "US": 3, "USA": 3,
    "SG": 3, "SGP": 3,
    # Schengen countries
    "FR": 3, "FRA": 3,
    "DE": 3, "DEU": 3,
    "IT": 3, "ITA": 3,
    "ES": 3, "ESP": 3,
    "NL": 3, "NLD": 3,
}

class BankStatementValidator:
    async def validate(
        self,
        db: AsyncSession,
        application_id: uuid.UUID,
        document_id: uuid.UUID,
        passport_name: str,        # from mrz_data
        visa_type_id: uuid.UUID,         # to get requirements
        applicant_nationality: str
    ) -> dict:
        results = {
            "validation_id": uuid.uuid4(),
            "document_id": document_id,
            "overall_status": None,   # PASS/WARNING/FAIL
            "can_proceed": False,
            "document_quality": {},
            "name_validation": {},
            "date_validation": {},
            "balance_validation": {},
            "issues": [],
            "warnings": [],
            "checklist_updated": False,
            "next_step": "document_upload"
        }

        # 1. Fetch the UploadedDocument record
        doc_result = await db.execute(
            select(UploadedDocument).where(
                UploadedDocument.id == document_id,
                UploadedDocument.application_id == application_id
            )
        )
        doc = doc_result.scalars().first()
        if not doc:
            results["overall_status"] = "FAIL"
            results["issues"].append("Bank statement document record not found in the database.")
            return results

        # 2. Get VisaType details and country code
        vt_result = await db.execute(
            select(VisaType).where(VisaType.id == visa_type_id)
        )
        visa_type = vt_result.scalars().first()
        country_code = visa_type.country_code.upper() if visa_type else "US"

        # 3. Get VisaRequirement details to retrieve data-driven max_age_days
        req_result = await db.execute(
            select(VisaRequirement).where(
                VisaRequirement.visa_type_id == visa_type_id,
                VisaRequirement.document_type == DocumentType.bank_statement
            )
        )
        req = req_result.scalars().first()
        max_age_days = req.max_age_days if (req and req.max_age_days) else 90

        # Determine required months based on country rules
        required_months = COUNTRY_REQUIRED_MONTHS.get(country_code, 3)

        # 4. Extract data using OCR engine
        ocr_engine = BankStatementOCR()
        try:
            extracted = ocr_engine.extract(doc.file_path, doc.mime_type)
        except Exception as e:
            results["overall_status"] = "FAIL"
            results["issues"].append(f"OCR Extraction failed: {str(e)}")
            return results

        # 5. Layer 1 — Document Quality Check
        quality = self.check_document_quality(doc.file_path, extracted)
        results["document_quality"] = quality
        if quality["status"] == "FAIL":
            results["issues"].append("Document quality check failed: Unable to verify document as a valid bank statement.")

        # 6. Layer 2 — Name Validation
        name_val = self.validate_name(extracted["account_holder_name"], passport_name)
        results["name_validation"] = name_val
        if name_val["status"] == "FAIL":
            results["issues"].append("Name validation failed: Account holder name does not match passport.")
        elif name_val["status"] == "WARNING":
            results["warnings"].append(name_val["message"])

        # 7. Layer 3 — Date Range Validation
        date_val = self.validate_dates(extracted["from_date"], extracted["to_date"], required_months, max_age_days)
        results["date_validation"] = date_val
        if date_val["status"] == "FAIL":
            results["issues"].extend(date_val.get("issues", []))
        elif date_val["status"] == "WARNING":
            results["warnings"].extend(date_val.get("warnings", []))

        # 8. Layer 4 — Balance Validation
        balance_val = self.validate_balance(extracted["closing_balance"], extracted["currency"], country_code)
        results["balance_validation"] = balance_val
        if balance_val["status"] == "WARNING":
            results["warnings"].append(balance_val["message"])

        # 9. Layer 5 — Overall Status
        self.determine_overall_status(results)

        # Ensure lists are cleanly serialized
        results["validation_id"] = str(results["validation_id"])
        results["document_id"] = str(results["document_id"])

        return results

    def check_document_quality(self, file_path, extracted_data):
        # We check if text is extracted successfully and contains keywords
        confidence = extracted_data.get("ocr_confidence", 0.0)
        is_confirmed = False
        
        # Keywords to verify
        keywords = ['account', 'balance', 'statement', 'transaction', 'bank']
        
        # Check text if possible (using text from PDF directly, or checking extracted fields)
        has_keywords = False
        
        # Simple heuristic: if we successfully parsed name, balance, dates, it has high likelihood of being a bank statement
        parsed_fields_count = sum(1 for k in ["account_holder_name", "closing_balance", "from_date", "to_date"] if extracted_data.get(k))
        if parsed_fields_count >= 2:
            has_keywords = True
            
        is_confirmed = has_keywords and (confidence > 0.40)
        status = "PASS" if is_confirmed else "FAIL"

        return {
            "status": status,
            "confidence": confidence,
            "is_bank_statement_confirmed": is_confirmed
        }

    def validate_name(
        self,
        statement_name,
        passport_name
    ):
        if not statement_name or not passport_name:
            return {
                "status": "FAIL",
                "passport_name": passport_name or "",
                "statement_name": statement_name or "",
                "match_score": 0.0,
                "message": "Missing name on statement or passport"
            }

        s_clean = statement_name.upper().strip()
        p_clean = passport_name.upper().strip()

        # 1. Fuzzy match via SequenceMatcher
        ratio = difflib.SequenceMatcher(None, s_clean, p_clean).ratio()

        # 2. Check word sets to handle reversed names (e.g. "JOHN DOE" vs "DOE JOHN")
        s_words = set(s_clean.split())
        p_words = set(p_clean.split())

        if s_words == p_words:
            ratio = max(ratio, 1.0)
        # 3. Check subsets for middle names (e.g. "JOHN MICHAEL DOE" vs "JOHN DOE")
        elif p_words.issubset(s_words) or s_words.issubset(p_words):
            ratio = max(ratio, 0.90)
        else:
            # Word overlap coefficient
            overlap = s_words.intersection(p_words)
            if overlap:
                word_ratio = len(overlap) / min(len(s_words), len(p_words))
                if word_ratio >= 1.0:
                    ratio = max(ratio, 0.85)

        # Status rules
        if ratio >= 0.80:
            status = "PASS"
            message = "Name matches passport"
        elif ratio >= 0.60:
            status = "WARNING"
            message = "Fuzzy name match - minor mismatch or spelling difference"
        else:
            status = "FAIL"
            message = f"Name on bank statement ('{statement_name}') does not match passport ('{passport_name}')"

        return {
            "status": status,
            "passport_name": passport_name,
            "statement_name": statement_name,
            "match_score": round(ratio, 2),
            "message": message
        }

    def validate_dates(
        self,
        from_date,
        to_date,
        required_months,
        max_age_days=90
    ):
        issues = []
        warnings = []
        status = "PASS"
        is_recent = True
        days_old = 0

        if not from_date or not to_date:
            return {
                "status": "FAIL",
                "from_date": None,
                "to_date": None,
                "months_covered": 0.0,
                "required_months": required_months,
                "is_recent": False,
                "days_old": 999,
                "message": "Statement start or end date is missing or unreadable.",
                "issues": ["Missing statement dates"]
            }

        # Date conversions if strings
        if isinstance(from_date, str):
            from_date = datetime.strptime(from_date.split("T")[0], "%Y-%m-%d").date()
        elif isinstance(from_date, datetime):
            from_date = from_date.date()

        if isinstance(to_date, str):
            to_date = datetime.strptime(to_date.split("T")[0], "%Y-%m-%d").date()
        elif isinstance(to_date, datetime):
            to_date = to_date.date()

        # Recency validation: check statement end date vs today
        today = date.today()
        days_old = (today - to_date).days

        if days_old > max_age_days:
            status = "FAIL"
            is_recent = False
            issues.append(f"Statement is too old: {days_old} days old (maximum allowed is {max_age_days} days).")
        elif days_old > 30:
            status = "WARNING"
            is_recent = False
            warnings.append(f"Statement end date is {days_old} days old (should ideally be within the last 30 days).")

        # Range validation: check covered months
        days_covered = (to_date - from_date).days
        months_covered = round(days_covered / 30.0, 1)

        if months_covered < required_months:
            if status != "FAIL":
                status = "WARNING"
            warnings.append(f"Statement covers {months_covered} months, but {required_months} months are required.")

        message = "Statement dates are valid" if status == "PASS" else ("Warnings on statement dates" if status == "WARNING" else "Statement dates failed validation")

        return {
            "status": status,
            "from_date": from_date.isoformat(),
            "to_date": to_date.isoformat(),
            "months_covered": months_covered,
            "required_months": required_months,
            "is_recent": is_recent,
            "days_old": days_old,
            "message": message,
            "issues": issues,
            "warnings": warnings
        }

    def validate_balance(
        self,
        balance,
        currency,
        destination_country
    ):
        import os
        from app.core.config import settings

        currency = (currency or "USD").upper().strip()
        balance = float(balance) if balance is not None else 0.0

        # Load limits from settings or env
        min_required = 2000.00
        if currency == "AED":
            min_required = float(os.getenv("BANK_STATEMENT_MIN_BALANCE_AED", settings.BANK_STATEMENT_MIN_BALANCE_AED))
        elif currency == "GBP":
            min_required = float(os.getenv("BANK_STATEMENT_MIN_BALANCE_GBP", settings.BANK_STATEMENT_MIN_BALANCE_GBP))
        elif currency == "USD":
            min_required = float(os.getenv("BANK_STATEMENT_MIN_BALANCE_USD", settings.BANK_STATEMENT_MIN_BALANCE_USD))
        elif currency == "EUR":
            min_required = float(os.getenv("BANK_STATEMENT_MIN_BALANCE_EUR", settings.BANK_STATEMENT_MIN_BALANCE_EUR))
        elif currency == "SGD":
            min_required = float(os.getenv("BANK_STATEMENT_MIN_BALANCE_SGD", settings.BANK_STATEMENT_MIN_BALANCE_SGD))

        shortfall = 0.0
        status = "PASS"
        message = f"Balance meets the recommended minimum requirement of {currency} {min_required:,.2f}"

        if balance < min_required:
            shortfall = round(min_required - balance, 2)
            status = "WARNING"
            message = f"Balance of {currency} {balance:,.2f} is below the recommended minimum of {currency} {min_required:,.2f}"

        return {
            "status": status,
            "detected_balance": balance,
            "currency": currency,
            "minimum_required": min_required,
            "shortfall": shortfall,
            "message": message
        }

    def determine_overall_status(self, results):
        quality_status = results["document_quality"].get("status", "FAIL")
        name_status = results["name_validation"].get("status", "FAIL")
        date_status = results["date_validation"].get("status", "FAIL")
        balance_status = results["balance_validation"].get("status", "FAIL")

        if quality_status == "FAIL" or name_status == "FAIL" or date_status == "FAIL":
            results["overall_status"] = "FAIL"
            results["can_proceed"] = False
        elif quality_status == "WARNING" or name_status == "WARNING" or date_status == "WARNING" or balance_status == "WARNING":
            results["overall_status"] = "WARNING"
            results["can_proceed"] = True
        else:
            results["overall_status"] = "PASS"
            results["can_proceed"] = True
