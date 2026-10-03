import pytest
from pydantic import ValidationError

from hermesdesk.types import ProposedResponse


def test_valid_proposal():
    p = ProposedResponse(
        customer_reply_ar="شكراً لتواصلكم",
        rationale_ar="معرفة",
        risk="low",
        specialist="knowledge",
    )
    assert p.language == "ar"


def test_empty_reply_rejected():
    with pytest.raises(ValidationError):
        ProposedResponse(
            customer_reply_ar="",
            rationale_ar="x",
            risk="low",
            specialist="knowledge",
        )


def test_bad_action_rejected():
    with pytest.raises(ValidationError):
        ProposedResponse(
            customer_reply_ar="مرحباً بك",
            rationale_ar="x",
            risk="low",
            specialist="knowledge",
            actions=[{"type": "rm_rf", "payload": {}}],
        )
