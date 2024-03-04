from typing import Any, Tuple, Type, Union

import funcy
from django.contrib import admin
from django.db.models import CharField, Field, Model, TextField
from django.db.models.query_utils import DeferredAttribute
from enumfields import EnumField
from enumfields.admin import EnumFieldListFilter
from safedelete.admin import SafeDeleteAdmin

from utilities.serializer_helpers import get_serializer_field


class NameAndDescriptionMixin(Model):
    class Meta:
        abstract = True

    name = CharField(max_length=100, blank=False)
    description = TextField()


class ReprMixin(Model):
    class Meta:
        abstract = True

    STR_ATTRIBUTES: Tuple[Union[str, Field], ...] = None
    LIMIT_STR_ATTR_LENGTH = 40
    LIMIT_REPR_ATTR_LENGTH = 40

    @staticmethod
    def _cut_string(string: str, limit: int) -> str:
        if len(string) > limit:
            return string[:limit - 3] + '...'

        return string

    # noinspection PyMethodMayBeStatic
    def _get_nested_attribute_value(self, path: str) -> Any:
        try:
            return eval('self.' + path.replace('__', '.'))
        except AttributeError:
            return None

    @classmethod
    def _get_str_attributes(cls):
        if cls.STR_ATTRIBUTES:
            attributes = [get_serializer_field(attribute) for attribute in cls.STR_ATTRIBUTES]

            if not {'id', 'pk'}.intersection(attributes):
                attributes.insert(0, 'pk')
        else:
            attributes = [field.attname for field in cls._meta.fields]

        return attributes

    def __str__(self):
        return ', '.join(
            attribute + ': ' +
            self._cut_string(str(self._get_nested_attribute_value(attribute)), self.LIMIT_STR_ATTR_LENGTH)
            for attribute in self._get_str_attributes()
        )

    def __repr__(self):
        return \
            self.__class__.__name__ + '(' + ', '.join(
                f'{field.attname}={self._cut_string(repr(getattr(self, field.attname)), self.LIMIT_REPR_ATTR_LENGTH)}'
                for field in self._meta.fields
            ) + ')'

    @classmethod
    @funcy.memoize
    def get_model_admin(cls) -> Type[admin.ModelAdmin]:
        special_fields = ('created_at', 'updated_at', 'deleted')

        defined_fields = [field_name for field_name in cls._get_str_attributes() if field_name not in special_fields]

        native_fields = [
            field_name
            for field_name in defined_fields
            if isinstance(getattr(cls, field_name, None), DeferredAttribute)
        ]

        if hasattr(cls, 'deleted_objects'):
            parent_class = SafeDeleteAdmin
        else:
            parent_class = admin.ModelAdmin

        class ConcreteModelAdmin(parent_class):
            list_display = defined_fields
            list_filter = [(field.name, EnumFieldListFilter)
                           for field in cls._meta.fields
                           if isinstance(field, EnumField) and field.name in defined_fields]

        for extra_field in special_fields:
            if isinstance(getattr(cls, extra_field, None), DeferredAttribute):
                ConcreteModelAdmin.list_display.append(extra_field)

        for unaccepted_field_name in set(defined_fields) - set(native_fields):
            setattr(
                ConcreteModelAdmin,
                unaccepted_field_name,
                lambda self, obj, __field_name=unaccepted_field_name: cls._get_nested_attribute_value(obj, __field_name)
            )
            getattr(ConcreteModelAdmin, unaccepted_field_name).short_description = unaccepted_field_name

        ConcreteModelAdmin.__name__ = f'{cls.__name__}ModelAdmin'

        return ConcreteModelAdmin
