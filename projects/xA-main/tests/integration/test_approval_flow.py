from hermesdesk.types import ProposedResponse


def test_approve_uses_hashable_draft():
    p = ProposedResponse(
        customer_reply_ar="نص معتمد للعميل",
        rationale_ar="موافق",
        risk="low",
        specialist="sales",
    )
    assert p.customer_reply_ar
