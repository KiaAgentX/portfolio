FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Remove build tools to reduce attack surface
RUN apt-get purge -y build-essential && apt-get autoremove -y

COPY src/ ./src/
COPY configs/ ./configs/
COPY scripts/ ./scripts/
COPY .env.example .env

EXPOSE 8501
CMD ["python", "-m", "src.multi_asset_runner"]