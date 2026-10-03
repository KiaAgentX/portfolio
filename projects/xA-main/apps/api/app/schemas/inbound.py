from pydantic import BaseModel, Field


class EmailInbound(BaseModel):
    from_email: str = Field(alias="from")
    to: str | None = None
    subject: str | None = None
    text: str | None = None
    html: str | None = None
    secret: str | None = None

    model_config = {"populate_by_name": True}
