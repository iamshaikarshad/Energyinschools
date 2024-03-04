import json
from datetime import datetime, timedelta, timezone
from typing import NamedTuple

import jwt


class RestSessionPayload(NamedTuple):
    token: str
    expired_at: datetime

    @staticmethod
    def from_jwt_token(token: str):
        return RestSessionPayload(
            token=token,
            expired_at=datetime.fromtimestamp(jwt.decode(token, verify=False)['exp'])
        )

    @staticmethod
    def from_custom_token(token: str, live_time: timedelta):
        return RestSessionPayload(
            token=token,
            expired_at=datetime.now(tz=timezone.utc) + live_time
        )

    @staticmethod
    def from_custom_token_with_expiry_date(token: str, expiry_date: datetime):
        '''UTC expirty date should be passed!'''
        return RestSessionPayload(
            token=token,
            expired_at=expiry_date
        )

    def is_expired(self):
        return (self.expired_at - datetime.now(tz=timezone.utc)) < timedelta(seconds=10)

    @staticmethod
    def from_json(json_data: str):
        data = json.loads(json_data)
        return RestSessionPayload(
            token=data['token'],
            expired_at=datetime.fromtimestamp(data['expired_at'], tz=timezone.utc)
        )

    def to_json(self):
        return json.dumps({
            'token': self.token,
            'expired_at': self.expired_at.timestamp()
        })
