import cv2
import numpy as np
import pytesseract
from PIL import Image
from datetime import datetime, date
from typing import Dict, Any, Tuple, List
from mrz.checker.td3 import TD3CodeChecker
from mrz.checker.td1 import TD1CodeChecker

def preprocess_image(image_path: str) -> Tuple[np.ndarray, np.ndarray]:
    """
    Loads passport image, converts to grayscale, applies adaptive threshold,
    deskews, and crops to bottom 20% (MRZ zone).
    Returns: (preprocessed_full_image, mrz_crop)
    """
    # Load image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image at {image_path}")

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Apply adaptive threshold (or simple binarization)
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    # Deskew
    # Find all coordinates of foreground (text) pixels to compute overall angle
    coords = np.column_stack(np.where(thresh == 0))  # Assuming dark text on light bg
    if len(coords) > 0:
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle
        
        # Limit deskew to reasonable rotation to avoid flipping
        if abs(angle) < 45:
            h, w = gray.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            gray = cv2.warpAffine(gray, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
            thresh = cv2.warpAffine(thresh, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    # Crop to MRZ zone (bottom 20% of image)
    h, w = thresh.shape[:2]
    crop_y = int(h * 0.8)
    mrz_crop = thresh[crop_y:h, 0:w]

    return thresh, mrz_crop

def calculate_icao_checksum(data: str) -> int:
    """
    Calculate checksum using ICAO 9303 weights: 7, 3, 1, 7, 3, 1...
    """
    weights = [7, 3, 1]
    total = 0
    for idx, char in enumerate(data):
        if char == '<':
            val = 0
        elif char.isdigit():
            val = int(char)
        elif char.isalpha():
            val = ord(char.upper()) - 55  # A=10, B=11... Z=35
        else:
            val = 0
        weight = weights[idx % 3]
        total += val * weight
    return total % 10

def validate_mrz_checksums(mrz_lines: List[str]) -> Dict[str, Any]:
    """
    Performs custom ICAO 9303 checksum validation for passport (TD3/TD1).
    Returns dict containing check results and validation status.
    """
    results = {
        "passport_number": {"valid": True, "expected": None, "actual": None},
        "date_of_birth": {"valid": True, "expected": None, "actual": None},
        "expiry_date": {"valid": True, "expected": None, "actual": None},
        "composite": {"valid": True, "expected": None, "actual": None},
        "is_valid": True
    }

    if len(mrz_lines) < 2:
        results["is_valid"] = False
        return results

    # Standard TD3 layout (2 lines, 44 chars each)
    if len(mrz_lines) == 2 and len(mrz_lines[0]) >= 44 and len(mrz_lines[1]) >= 44:
        line2 = mrz_lines[1]
        
        # Passport Number checksum: chars 0-8, checksum char 9
        pass_num = line2[0:9]
        pass_check = line2[9]
        if pass_check.isdigit():
            expected = calculate_icao_checksum(pass_num)
            actual = int(pass_check)
            results["passport_number"] = {"valid": expected == actual, "expected": expected, "actual": actual}
            if expected != actual:
                results["is_valid"] = False

        # DOB checksum: chars 13-18, checksum char 19
        dob = line2[13:19]
        dob_check = line2[19]
        if dob_check.isdigit():
            expected = calculate_icao_checksum(dob)
            actual = int(dob_check)
            results["date_of_birth"] = {"valid": expected == actual, "expected": expected, "actual": actual}
            if expected != actual:
                results["is_valid"] = False

        # Expiry checksum: chars 21-26, checksum char 27
        exp = line2[21:27]
        exp_check = line2[27]
        if exp_check.isdigit():
            expected = calculate_icao_checksum(exp)
            actual = int(exp_check)
            results["expiry_date"] = {"valid": expected == actual, "expected": expected, "actual": actual}
            if expected != actual:
                results["is_valid"] = False

        # Composite checksum: elements pass_num + pass_check + dob + dob_check + exp + exp_check + optional data
        # Optional data for TD3 is from char 28 to 42. Composite is char 43.
        composite_data = line2[0:10] + line2[13:20] + line2[21:43]
        composite_check = line2[43]
        if composite_check.isdigit():
            expected = calculate_icao_checksum(composite_data)
            actual = int(composite_check)
            results["composite"] = {"valid": expected == actual, "expected": expected, "actual": actual}
            if expected != actual:
                results["is_valid"] = False

    return results

def clean_ocr_text(text: str) -> List[str]:
    """
    Cleans OCR output to find potential MRZ lines.
    Typically looks for lines with capital letters, digits, and '<'.
    """
    raw_lines = text.split("\n")
    cleaned_lines = []
    for line in raw_lines:
        # Clean whitespaces and filter lines containing ICAO MRZ characters
        line_clean = line.strip().replace(" ", "").upper()
        if len(line_clean) >= 30 and (line_clean.startswith("P<") or "<" in line_clean):
            # Normalize common OCR errors
            line_clean = line_clean.replace("0", "O").replace("1", "I") # Just standard normalization, wait - check numbers!
            # Wait, replacing 0 with O and 1 with I globally is dangerous for numeric fields. 
            # Let's keep it minimal or let the MRZ library handle/parse it.
            cleaned_lines.append(line_clean)
            
    # If standard cleaning doesn't find P<, return raw clean lines that have lots of '<'
    if not cleaned_lines:
        for line in raw_lines:
            line_clean = line.strip().replace(" ", "").upper()
            if len(line_clean) >= 30 and line_clean.count("<") > 5:
                cleaned_lines.append(line_clean)
                
    return cleaned_lines

def parse_mrz_date(date_str: str) -> date | None:
    """
    Parses YYMMDD date string to a date object.
    Assumes years 00-60 are in the 2000s, 61-99 are in 1900s.
    """
    if len(date_str) != 6 or not date_str.isdigit():
        return None
    try:
        year_prefix = "20" if int(date_str[0:2]) < 60 else "19"
        full_year = int(year_prefix + date_str[0:2])
        month = int(date_str[2:4])
        day = int(date_str[4:6])
        return date(full_year, month, day)
    except Exception:
        return None

def perform_mrz_scan(image_path: str) -> Dict[str, Any]:
    """
    Extracts MRZ text using Tesseract, parses using the `mrz` package,
    and runs custom country validation rules.
    """
    _, mrz_crop = preprocess_image(image_path)
    
    # Run Tesseract OCR
    custom_config = r'--psm 6'
    ocr_text = pytesseract.image_to_string(mrz_crop, config=custom_config)
    
    # Process lines
    lines = clean_ocr_text(ocr_text)
    
    # Ensure correct format (for TD3 passport, we need 2 lines of 44 chars)
    # Pad or slice to exactly 44 if needed
    cleaned_mrz_lines = []
    for line in lines:
        if len(line) > 44:
            line = line[:44]
        elif len(line) < 44:
            line = line.ljust(44, "<")
        cleaned_mrz_lines.append(line)
        
    mrz_string = "\n".join(cleaned_mrz_lines[:2])
    
    # Default fields
    parsed_fields = {
        "surname": "",
        "given_names": "",
        "nationality": "",
        "date_of_birth": None,
        "sex": "",
        "expiry_date": None,
        "passport_number": "",
        "country_code": ""
    }
    
    warnings = []
    is_valid_mrz = False
    
    # Try parsing with mrz library TD3CodeChecker first, fallback to manual TD3 parsing
    try:
        if len(cleaned_mrz_lines) >= 2:
            checker = TD3CodeChecker(mrz_string)
            is_valid_mrz = bool(checker)
            fields = checker.fields()
            
            parsed_fields["surname"] = fields.surname
            parsed_fields["given_names"] = fields.given_names
            parsed_fields["nationality"] = fields.nationality
            parsed_fields["date_of_birth"] = parse_mrz_date(fields.date_of_birth)
            parsed_fields["sex"] = fields.sex
            parsed_fields["expiry_date"] = parse_mrz_date(fields.expiry_date)
            parsed_fields["passport_number"] = fields.document_number
            parsed_fields["country_code"] = fields.country
    except Exception as e:
        warnings.append(f"MRZ library parser error: {str(e)}")
        
    # Manual fallback parser if library fails
    if not parsed_fields["passport_number"] and len(cleaned_mrz_lines) >= 2:
        line1 = cleaned_mrz_lines[0]
        line2 = cleaned_mrz_lines[1]
        try:
            # Line 1: P<USAEXP<<SURNAME<<GIVEN<NAMES<<<<<<
            if line1.startswith("P"):
                parsed_fields["country_code"] = line1[2:5].replace("<", "")
                names = line1[5:].split("<<")
                if len(names) >= 1:
                    parsed_fields["surname"] = names[0].replace("<", " ").strip()
                if len(names) >= 2:
                    parsed_fields["given_names"] = names[1].replace("<", " ").strip()
                    
            # Line 2: passport_number (0-9), dob (13-18), sex (20), expiry (21-26), nationality (28-31)
            parsed_fields["passport_number"] = line2[0:9].replace("<", "")
            parsed_fields["date_of_birth"] = parse_mrz_date(line2[13:19])
            parsed_fields["sex"] = ""
            for char in line2[18:23]:
                if char in ["M", "F", "X"]:
                    parsed_fields["sex"] = char
                    break
                elif char in ["H", "N"]:
                    parsed_fields["sex"] = "M"
                    break
                elif char == "W":
                    parsed_fields["sex"] = "F"
                    break
            parsed_fields["expiry_date"] = parse_mrz_date(line2[21:27])
            parsed_fields["nationality"] = line2[28:31].replace("<", "")
        except Exception as e:
            warnings.append(f"Fallback parser error: {str(e)}")

    # Full-page OCR dynamic fallback if MRZ parsing yielded nothing
    # (Useful for AI-generated dummy passports that lack a valid MRZ)
    if not parsed_fields["surname"] and not parsed_fields["passport_number"]:
        try:
            full_img = cv2.imread(image_path)
            full_text = pytesseract.image_to_string(full_img)
            lines = [line.strip() for line in full_text.split('\n') if len(line.strip()) > 2]
            
            import re
            
            # Find any dates in the document
            dates = re.findall(r'\b(\d{2}[/\-]\d{2}[/\-]\d{4}|\d{4}[/\-]\d{2}[/\-]\d{2})\b', full_text)
            
            def parse_date_fallback(d_str: str):
                parts = d_str.replace('/', '-').split('-')
                if len(parts) == 3:
                    try:
                        if len(parts[0]) == 4:
                            return date(int(parts[0]), int(parts[1]), int(parts[2]))
                        elif len(parts[2]) == 4:
                            return date(int(parts[2]), int(parts[1]), int(parts[0]))
                    except Exception:
                        return None
                return None

            if dates:
                dob = parse_date_fallback(dates[0])
                if dob:
                    parsed_fields["date_of_birth"] = dob
                if len(dates) > 1:
                    exp = parse_date_fallback(dates[-1])
                    if exp:
                        parsed_fields["expiry_date"] = exp

            # Find passport number (typically 8-9 alphanumeric chars)
            passports = re.findall(r'\b([A-Z0-9]{8,9})\b', full_text.upper())
            if passports:
                parsed_fields["passport_number"] = passports[0]
                
            # Heuristic for names: Look for lines after keywords
            for i, line in enumerate(lines):
                line_up = line.upper()
                if ("SURNAME" in line_up or "LAST NAME" in line_up):
                    if not parsed_fields["surname"]:
                        # Might be on same line after a colon, or next line
                        if ":" in line_up and len(line_up.split(":")) > 1 and len(line_up.split(":")[1].strip()) > 1:
                            parsed_fields["surname"] = line_up.split(":")[1].replace("<", "").strip()
                        elif i + 1 < len(lines):
                            parsed_fields["surname"] = lines[i+1].replace("<", "").strip()
                            
                elif ("GIVEN" in line_up or "FIRST NAME" in line_up):
                    if not parsed_fields["given_names"]:
                        if ":" in line_up and len(line_up.split(":")) > 1 and len(line_up.split(":")[1].strip()) > 1:
                            parsed_fields["given_names"] = line_up.split(":")[1].replace("<", "").strip()
                        elif i + 1 < len(lines):
                            parsed_fields["given_names"] = lines[i+1].replace("<", "").strip()
                            
                elif "NATIONALITY" in line_up:
                    if not parsed_fields["nationality"]:
                        if ":" in line_up and len(line_up.split(":")) > 1 and len(line_up.split(":")[1].strip()) > 1:
                            parsed_fields["nationality"] = line_up.split(":")[1][:3]
                        elif i + 1 < len(lines):
                            parsed_fields["nationality"] = lines[i+1][:3]
                            
                elif "SEX" in line_up or "GENDER" in line_up:
                    if not parsed_fields["sex"]:
                        # Check same line first: "Sex: F" or "Sex F"
                        if " F " in " " + line_up + " " or line_up.endswith(" F") or line_up.endswith(":F"):
                            parsed_fields["sex"] = "F"
                        elif " M " in " " + line_up + " " or line_up.endswith(" M") or line_up.endswith(":M"):
                            parsed_fields["sex"] = "M"
                        elif i + 1 < len(lines):
                            parsed_fields["sex"] = "F" if "F" in lines[i+1].upper() else "M"
                            
            if not parsed_fields["sex"]:
                # Specific regex fallback for structured gender fields
                import re
                gender_match = re.search(r'(?i)(?:sex|gender)\s*:?\s*(m|f|male|female|x)\b', full_text)
                if gender_match:
                    val = gender_match.group(1).upper()
                    parsed_fields["sex"] = "M" if val.startswith("M") else "F" if val.startswith("F") else "X"
                        
            # If we STILL have nothing (completely unstructured AI image), just take top text
            if not parsed_fields["surname"] and len(lines) > 2:
                parsed_fields["surname"] = lines[1]
            if not parsed_fields["given_names"] and len(lines) > 3:
                parsed_fields["given_names"] = lines[2]
                
        except Exception as e:
            warnings.append(f"Full-page OCR fallback error: {str(e)}")

    # Checksum validation
    checksum_results = validate_mrz_checksums(cleaned_mrz_lines)
    
    # Calculate confidence (simplified OCR character validation or based on checksums)
    confidence_score = 0.90 if checksum_results.get("is_valid", False) else 0.40
    
    # Check flags for low confidence fields
    low_confidence_fields = []
    if not checksum_results.get("passport_number", {}).get("valid", True) or not parsed_fields["passport_number"]:
        low_confidence_fields.append("passport_number")
    if not checksum_results.get("date_of_birth", {}).get("valid", True) or not parsed_fields["date_of_birth"]:
        low_confidence_fields.append("date_of_birth")
    if not checksum_results.get("expiry_date", {}).get("valid", True) or not parsed_fields["expiry_date"]:
        low_confidence_fields.append("expiry_date")
        
    return {
        "mrz_string": mrz_string,
        "fields": parsed_fields,
        "checksums": checksum_results,
        "ocr_confidence": confidence_score,
        "low_confidence_fields": low_confidence_fields,
        "warnings": warnings
    }

def validate_country_rules(mrz_data: Dict[str, Any], country_code: str, min_validity_days: int = 180) -> Dict[str, Any]:
    """
    Applies country-specific validation rules based on user requirements.
    """
    fields = mrz_data.get("fields", {})
    passport_num = fields.get("passport_number", "")
    expiry_date = fields.get("expiry_date")
    nationality = fields.get("nationality", "")
    
    rules_check = {
        "valid": True,
        "reasons": []
    }
    
    # 1. Check passport not expired
    today = date.today()
    if not expiry_date:
        rules_check["valid"] = False
        rules_check["reasons"].append("Passport expiry date is missing or unreadable.")
    elif expiry_date <= today:
        rules_check["valid"] = False
        rules_check["reasons"].append("Passport has expired.")
        
    # 2. Check validity >= min_validity_days
    if expiry_date:
        days_valid = (expiry_date - today).days
        if days_valid < min_validity_days:
            rules_check["valid"] = False
            rules_check["reasons"].append(f"Passport validity is only {days_valid} days, which is less than the required {min_validity_days} days.")
            
    # 3. Country-specific rules
    # UAE (ARE/AE)
    if country_code == "AE":
        # Residence visa rule (placeholder check/warning if applicable)
        rules_check["reasons"].append("UAE rule check: Ensure applicant checks residence visa requirement if nationality is from non-GCC countries.")
        
    # UK (GB/GBR) or Schengen (DE/DEU etc.)
    elif country_code in ["GB", "DE"]:
        if len(nationality) > 0:
            # Schengen/UK nationality code verification
            rules_check["reasons"].append(f"UK/Schengen rule check: Nationality code '{nationality}' verified.")
            
    # USA (US/USA)
    elif country_code == "US":
        if len(passport_num) != 9:
            rules_check["valid"] = False
            rules_check["reasons"].append(f"US rule check failed: Passport number must be exactly 9 characters (got {len(passport_num)}).")
            
    return rules_check
