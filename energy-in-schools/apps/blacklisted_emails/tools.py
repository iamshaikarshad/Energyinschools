from typing import NamedTuple
import base64

import jwt

from django.conf import settings


class AddEmailToBlackListToken(NamedTuple):
    email: str

    @classmethod
    def decode(cls, token: str):
        return cls(**jwt.decode(base64.urlsafe_b64decode(token), settings.SECRET_KEY))

    def encode(self) -> str:
        return base64.urlsafe_b64encode(jwt.encode(self._asdict(), settings.SECRET_KEY)).decode()

    def get_unsubscribe_email_link(self):
        return f'{settings.LINKS.UNSUBSCRIBE}{self.encode()}/'
