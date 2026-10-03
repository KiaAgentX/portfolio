from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    def __init__(self, message: str, status: int = 400):
        self.message = message
        self.status = status


def register_errors(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _app_err(_: Request, exc: AppError):
        return JSONResponse({"error": exc.message}, status_code=exc.status)
