from hermesdesk.arabic import looks_critical, normalize, truncate


def test_normalize_alef_and_tatweel():
    assert normalize("أإلـــه") == "الله" or "ا" in normalize("أحمد")
    assert "ـ" not in normalize("زيـــت")


def test_truncate():
    assert truncate("abc", 2).endswith("…")
    assert truncate("سلام", 10) == "سلام"


def test_critical():
    assert looks_critical("هناك حريق في المستودع")
    assert looks_critical("oil spill in tank")
    assert not looks_critical("ما هي لزوجة 15W-40")
