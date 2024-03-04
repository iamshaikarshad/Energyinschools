from typing import Any

from django.db import models
from safedelete.models import SafeDeleteModel, is_safedelete_cls

from apps.main.mixin import ReprMixin
from apps.main.model_mixins import ReprMixin


class BaseModel(ReprMixin, models.Model):
    class Meta:
        abstract = True

    sa: Any  # SQLAlchemy provided by aldjemy

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class SafeDeleteBaseModel(BaseModel, SafeDeleteModel):
    class Meta:
        abstract = True

    # to be the in same style like created_at and updated_at
    deleted = models.DateTimeField(editable=False, null=True, db_column='deleted_at')
