from typing import Dict, Any
from app.core import mrz_scanner

def validate_country_rules(mrz_data: Dict[str, Any], country_code: str, min_validity_days: int = 180) -> Dict[str, Any]:
    """
    Applies country-specific validation rules based on user requirements.
    """
    return mrz_scanner.validate_country_rules(mrz_data, country_code, min_validity_days)
