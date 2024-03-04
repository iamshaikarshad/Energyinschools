from typing import Any

import funcy


def get_serializer_field(field: Any) -> str:
    if isinstance(field, str):
        return field
    elif hasattr(field, 'attname'):
        return field.attname
    elif hasattr(field, 'field_name'):
        return field.field_name
    elif hasattr(field, 'field'):  # foreign key
        return field.field.attname
    elif hasattr(field, 'related'):  # one to one
        return field.related.related_name
    else:
        raise Exception('Unknown field type!')


def get_serializer_fields(*args, add_id: bool = True):
    return (('id',) if add_id else ()) + tuple(map(get_serializer_field, args))


def get_serializer_kwargs(kwargs):
    return funcy.walk_keys(get_serializer_field, kwargs)
