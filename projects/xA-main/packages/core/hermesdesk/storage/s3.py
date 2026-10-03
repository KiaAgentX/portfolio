from __future__ import annotations

import json
from functools import lru_cache

import boto3
from botocore.config import Config

from hermesdesk.config import get_settings


@lru_cache
def get_s3():
    s = get_settings()
    return boto3.client(
        "s3",
        endpoint_url=s.s3_endpoint,
        aws_access_key_id=s.s3_access_key_id,
        aws_secret_access_key=s.s3_secret_access_key,
        region_name=s.s3_region,
        config=Config(s3={"addressing_style": "path" if s.s3_force_path_style else "auto"}),
    )


def put_bytes(key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
    s = get_settings()
    get_s3().put_object(Bucket=s.s3_bucket, Key=key, Body=data, ContentType=content_type)
    return key


def put_json(key: str, obj: dict) -> str:
    body = json.dumps(obj, ensure_ascii=False, indent=2).encode()
    return put_bytes(key, body, "application/json")


def get_bytes(key: str) -> bytes:
    s = get_settings()
    resp = get_s3().get_object(Bucket=s.s3_bucket, Key=key)
    return resp["Body"].read()
