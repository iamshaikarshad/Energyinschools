from typing import Type

from enumfields import EnumField
from enumfields.drf import EnumField as EnumFieldDRF

from apps.resources.types import Unit


class AutoLengthEnumField(EnumField):
    def __init__(self, enum, **kwargs):
        max_length = (max(len(item.value) for item in enum) // 10 + 1) * 10
        kwargs.setdefault('max_length', max_length)
        super().__init__(enum, **kwargs)


class UnitAbbreviationEnumField(EnumFieldDRF):
    def __init__(self, enum: Type[Unit], lenient: bool = False, ints_as_names: bool = False, **kwargs):
        self.enum = enum
        self.lenient = lenient
        self.ints_as_names = ints_as_names
        kwargs['choices'] = tuple((e.abbreviation, getattr(e, 'label', e.name)) for e in self.enum)
        super(EnumFieldDRF, self).__init__(**kwargs)

    def to_representation(self, instance):
        if isinstance(instance, str):
            return instance
        super().to_representation(instance)
