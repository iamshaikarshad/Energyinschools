from django.db import models

from apps.main.models import BaseModel


class Theme(BaseModel):
    """Theme model for saving themes that will be displaying at screen"""
    name = models.CharField(max_length=400, blank=False, null=False)

