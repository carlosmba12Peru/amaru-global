# Dockerfile for COEN-Digital backend (FastAPI) on Cloud Run
FROM python:3.11-slim

WORKDIR /app

# Install basic system tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend source code and datasets
COPY . ./

# Cloud Run injects the PORT environment variable (default 8080)
ENV PORT=8080
EXPOSE 8080

# Production launch with uvicorn
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 2"]
