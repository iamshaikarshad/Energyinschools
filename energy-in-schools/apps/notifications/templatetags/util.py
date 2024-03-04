from typing import Dict, Optional
from collections.abc import Iterable

from django import template

from apps.resources.types import Unit

register = template.Library()


@register.filter
def is_iterable(value):
    return isinstance(value, Iterable)


@register.filter
def has_consumption(data: Optional[Dict]):
    return bool(data) if isinstance(data, dict) else False        


@register.filter
def transform_consumption_data(data: Dict):
    value: float = data['value']
    unit_name: str = data['unit']
    return f'{round(value, 2)} {Unit(unit_name).abbreviation}'
