FROM node:22-alpine AS admin
WORKDIR /admin
COPY apps/admin/package.json ./
RUN npm install
COPY apps/admin ./
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir \
    fastapi "uvicorn[standard]" sse-starlette "python-jose[cryptography]" \
    pydantic pydantic-settings "sqlalchemy[asyncio]" asyncpg alembic \
    redis arq httpx openai boto3 qdrant-client orjson bleach email-validator \
    pyarrow python-multipart cryptography
COPY packages/core /app/packages/core
COPY apps/api /app/apps/api
ENV PYTHONPATH=/app/packages/core:/app/apps/api
COPY --from=admin /admin/dist /app/apps/api/app/static
ENV PORT=8080
WORKDIR /app/apps/api
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
