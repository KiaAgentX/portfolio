FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir \
    pydantic pydantic-settings "sqlalchemy[asyncio]" asyncpg \
    redis arq httpx openai boto3 qdrant-client orjson bleach \
    pyarrow python-multipart cryptography
COPY packages/core /app/packages/core
COPY apps/worker /app/apps/worker
ENV PYTHONPATH=/app/packages/core:/app/apps/worker
WORKDIR /app/apps/worker
CMD ["python", "-m", "arq", "worker.main.WorkerSettings"]
