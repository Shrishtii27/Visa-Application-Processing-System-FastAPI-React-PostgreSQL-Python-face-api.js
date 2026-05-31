from typing import Dict, Any, List
from app.core import mrz_scanner

def calculate_icao_checksum(data: str) -> int:
    """
    Calculate checksum using ICAO 9303 weights: 7, 3, 1, 7, 3, 1...
    """
    return mrz_scanner.calculate_icao_checksum(data)

def validate_mrz_checksums(mrz_lines: List[str]) -> Dict[str, Any]:
    """
    Performs custom ICAO 9303 checksum validation for passport (TD3/TD1).
    """
    return mrz_scanner.validate_mrz_checksums(mrz_lines)
