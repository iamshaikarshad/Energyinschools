import base64
from typing import NamedTuple

import jwt

from django.conf import settings


class ResetPasswordToken(NamedTuple):
    user_id: int
    password_version: int

    @classmethod
    def decode(cls, token: str):
        return cls(**jwt.decode(base64.urlsafe_b64decode(token), settings.SECRET_KEY))

    def encode(self) -> str:
        return base64.urlsafe_b64encode(jwt.encode(self._asdict(), settings.SECRET_KEY)).decode()

    def get_reset_password_email_link(self):
        return f'{settings.LINKS.RESET_PASSWORD}{self.encode()}/'
