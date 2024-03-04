from django_filters import compat
from django_filters.rest_framework import DjangoFilterBackend, filters


class EnumSupportedFilterBackend(DjangoFilterBackend):
    def get_coreschema_field(self, field):  # todo: make a pull request!
        description = str(field.extra.get('help_text', ''))

        if isinstance(field, filters.NumberFilter):
            return compat.coreschema.Number(description=description)

        if field.extra.get('choices'):
            enum_field_class = compat.coreschema.Enum(
                enum=[choice for choice, _ in field.extra['choices']],
                description=description
            )

            if isinstance(field, filters.ChoiceFilter):
                return enum_field_class

            if isinstance(field, filters.MultipleChoiceFilter) and field.extra.get('choices'):
                return compat.coreschema.Array(enum_field_class, description=description)

        return compat.coreschema.String(description=description)
