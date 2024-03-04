import stringcase


def get_converter_by_enum(an_enum, extra_mapping=None):
    class Converter:
        enum_to_url_map = {item: stringcase.spinalcase(item.value).strip('-') for item in an_enum}
        url_to_enum_map = {value: key for key, value in enum_to_url_map.items()}
        # FIXME: this is added to backward compatibility with old code on raspberry hubs
        if extra_mapping:
            url_to_enum_map.update(extra_mapping)
        regex = '|'.join(url_to_enum_map)

        @classmethod
        def to_python(cls, value: str):
            return cls.url_to_enum_map[value]

        @classmethod
        def to_url(cls, value):
            return cls.enum_to_url_map[value]

    Converter.__name__ = an_enum.__name__

    return Converter
