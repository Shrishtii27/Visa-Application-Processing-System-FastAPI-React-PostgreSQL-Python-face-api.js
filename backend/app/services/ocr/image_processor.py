import numpy as np
from typing import Tuple
from app.core import mrz_scanner

def preprocess_image(image_path: str) -> Tuple[np.ndarray, np.ndarray]:
    """
    Loads passport image, converts to grayscale, applies adaptive threshold,
    deskews, and crops to bottom 20% (MRZ zone).
    """
    return mrz_scanner.preprocess_image(image_path)
