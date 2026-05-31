from typing import Dict, Any, List
from app.core import mrz_scanner
from app.core.mrz_scanner import parse_mrz_date

def clean_ocr_text(text: str) -> List[str]:
    """
    Cleans OCR output to find potential MRZ lines.
    """
    return mrz_scanner.clean_ocr_text(text)

def perform_mrz_scan(image_path: str) -> Dict[str, Any]:
    """
    Extracts MRZ text using Tesseract, parses using the `mrz` package,
    and runs custom country validation rules.
    """
    return mrz_scanner.perform_mrz_scan(image_path)
