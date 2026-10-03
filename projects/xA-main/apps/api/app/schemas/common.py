from pydantic import BaseModel


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    name: str
    role: str


class LoginIn(BaseModel):
    email: str
    password: str
