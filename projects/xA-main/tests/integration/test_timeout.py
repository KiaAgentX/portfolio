FALLBACK = "نعتذر عن التأخير. سيتواصل معكم أحد المختصين قريباً."


def test_fallback_is_apology_not_draft():
    assert "نعتذر" in FALLBACK
    assert "توربين" not in FALLBACK
    assert "مسودة" not in FALLBACK
