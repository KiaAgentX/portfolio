from hermesdesk.agents.intent import heuristic_intent


def test_sales():
    assert heuristic_intent("نحتاج عرض سعر 200 برميل توربين أويل") == "sales"


def test_knowledge():
    assert heuristic_intent("ما لزوجة SAE المناسبة لمحرك ديزل") == "knowledge"


def test_support_critical():
    assert heuristic_intent("حريق في المستودع") == "support"
