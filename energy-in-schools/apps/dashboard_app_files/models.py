from django.db import models

from apps.main.model_mixins import NameAndDescriptionMixin
from apps.main.models import BaseModel


class DashboardApp(BaseModel, NameAndDescriptionMixin):
    """ Model for storing dashboard app for Tizen TV"""
    app_file = models.FileField(upload_to='dashboard-app/')

    STR_ATTRIBUTES = (
        'name',
        'id'
    )
