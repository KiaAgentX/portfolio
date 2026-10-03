from hermesdesk.storage.paths import archive_key, inbound_key


def test_paths():
    assert inbound_key("default", "abc").startswith("inbound/default/")
    assert "transcript.json" in archive_key("default", "tid", "transcript.json")
