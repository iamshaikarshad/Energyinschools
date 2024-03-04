from typing import TypeVar

from enumfields import Enum


EnumClass = TypeVar('EnumClass', bound=Enum)


class IntValueEnumMixin:
    def __new__(cls, value, int_value):
        obj = object.__new__(cls)
        obj._value_ = value
        obj._int_value_ = int_value
        return obj

    @property
    def int_value(self) -> int:
        return self._int_value_

    @classmethod
    def from_int(cls: EnumClass, int_value: int) -> EnumClass:
        for option in cls:
            if option.int_value == int_value:
                return option

        raise ValueError('Wrong int value for the enum!')
