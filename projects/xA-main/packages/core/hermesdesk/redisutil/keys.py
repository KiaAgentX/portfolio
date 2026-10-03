class Keys:
    prefix = "hd"

    @classmethod
    def lock_conv(cls, conversation_id: str) -> str:
        return f"{cls.prefix}:lock:conv:{conversation_id}"

    @classmethod
    def lock_ticket(cls, ticket_id: str) -> str:
        return f"{cls.prefix}:lock:ticket:{ticket_id}"

    @classmethod
    def approval_ttl(cls, ticket_id: str) -> str:
        return f"{cls.prefix}:approval:ttl:{ticket_id}"

    @classmethod
    def dedup(cls, channel: str, provider_message_id: str) -> str:
        return f"{cls.prefix}:dedup:{channel}:{provider_message_id}"

    @classmethod
    def rl_ip(cls, ip: str) -> str:
        return f"{cls.prefix}:rl:ip:{ip}"

    @classmethod
    def rl_ident(cls, channel: str, external_id: str) -> str:
        return f"{cls.prefix}:rl:ident:{channel}:{external_id}"

    SSE = "hd:sse:admins"
