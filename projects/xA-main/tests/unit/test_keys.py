from hermesdesk.ids import new_public_id
from hermesdesk.redisutil.keys import Keys


def test_keys():
    assert Keys.lock_conv("x").startswith("hd:lock:conv:")
    assert Keys.dedup("telegram", "1") == "hd:dedup:telegram:1"
    assert Keys.SSE == "hd:sse:admins"


def test_public_id():
    pid = new_public_id()
    assert pid.startswith("TCK-")
