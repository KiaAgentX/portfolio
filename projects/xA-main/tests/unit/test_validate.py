from hermesdesk.security.secrets import hash_password, verify_password
from hermesdesk.security.validate import allowed_mime, sanitize_filename


def test_password_roundtrip():
    h = hash_password("secret")
    assert verify_password("secret", h)
    assert not verify_password("nope", h)


def test_filename():
    assert ".." not in sanitize_filename("../etc/passwd")
    assert allowed_mime("application/pdf")
    assert not allowed_mime("application/x-msdownload")
