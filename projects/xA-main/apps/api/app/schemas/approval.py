from pydantic import BaseModel


class ApproveIn(BaseModel):
    final_text_ar: str | None = None
    action_ids: list[str] = []
    note: str | None = None


class RejectIn(BaseModel):
    reason: str
    requeue: bool = False
