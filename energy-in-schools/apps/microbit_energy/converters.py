from apps.energy_providers.providers.abstract import MeterType


class MeterTypeConverter:
    regex = '|'.join(meter_type.value.lower() for meter_type in MeterType)

    @staticmethod
    def to_python(value: str):
        return MeterType(value.upper())

    @staticmethod
    def to_url(value: MeterType):
        return value.value.lower()
