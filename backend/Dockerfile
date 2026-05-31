FROM python:3.11-slim

# Install system dependencies for OCR (tesseract) and PDF processing (poppler)
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    poppler-utils \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create upload directories
RUN mkdir -p uploads/passports uploads/bank_statements uploads/documents uploads/faces

# Expose port
EXPOSE 10000

# Start the server (Render uses port 10000 by default)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]
