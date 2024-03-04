from django.db import models
from django_filters.rest_framework import ChoiceFilter, FilterSet
from enumfields import EnumField


class EnumSupportFilterSet(FilterSet):
    @classmethod
    def filter_for_lookup(cls, field: models.Field, lookup_type: str):
        if isinstance(field, EnumField):
            return ChoiceFilter, {'choices': field.enum.choices()}

        return super().filter_for_lookup(field, lookup_type)
