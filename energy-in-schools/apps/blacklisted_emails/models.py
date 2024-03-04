from django.db import models

from apps.main.models import BaseModel


class BlacklistedEmail(BaseModel):
    email = models.EmailField(unique=True)
