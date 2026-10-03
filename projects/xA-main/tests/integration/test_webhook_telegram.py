import pytest
from hermesdesk.types import InboundMessage


def test_inbound_shape():
    m = InboundMessage(
        channel="telegram",
        external_user_id="1",
        text="سلام",
        provider_message_id="9",
    )
    assert m.channel == "telegram"
