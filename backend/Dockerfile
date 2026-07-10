FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for langchain + audio processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    portaudio19-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Cloud Run provides PORT env var)
ENV PORT=8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/FetchAllSessions || exit 1

# Start uvicorn — Cloud Run injects PORT env var
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]
