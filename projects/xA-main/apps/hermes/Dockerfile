FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir fastapi uvicorn openai pydantic
COPY apps/hermes /app
EXPOSE 8088
CMD ["python", "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8088"]
