import random
from datetime import datetime, timedelta, timezone
from random import randint
from typing import Any, Callable, Dict, NamedTuple

from django.core.management import BaseCommand

from apps.resources.models import Resource
from apps.resources.tasks import select_resources_for_saving_values_to_long_term_history
from apps.resources.types import ResourceValue, Unit
from apps.smart_things_devices.types import Capability


class GeneratorConfig(NamedTuple):
    filters: Dict[str, Any]
    time_delta_generator: Callable[[datetime], timedelta]
    value_generator: Callable[[datetime], float]


GENERATOR_CONFIGS = (
    GeneratorConfig(
        filters=dict(
            child_type__in=(
                Resource.ChildType.ENERGY_METER,
                Resource.ChildType.MICROBIT_HISTORICAL_DATA_SET,
            ),
        ),
        time_delta_generator=lambda _: timedelta(seconds=randint(1, 100)),
        value_generator=lambda at_time: (12 - abs(12 - at_time.hour)) * 100 + at_time.minute + randint(50, 400)
    ),
    GeneratorConfig(
        filters=dict(child_type=Resource.ChildType.WEATHER_TEMPERATURE),
        time_delta_generator=lambda _: timedelta(seconds=randint(1, 100)),
        value_generator=lambda at_time: (12 - abs(12 - at_time.hour)) / 12 * 10 + 10
    ),
    GeneratorConfig(
        filters=dict(
            child_type=Resource.ChildType.SMART_THINGS_SENSOR,
            smart_things_sensor__capability=Capability.TEMPERATURE,
        ),
        time_delta_generator=lambda _: timedelta(minutes=randint(1, 10)),
        value_generator=lambda at_time: ((12 - abs(12 - at_time.hour)) / 12 * 10 + 10) * random.uniform(0.8, 1.2)
    ),
    GeneratorConfig(
        filters=dict(
            child_type=Resource.ChildType.SMART_THINGS_SENSOR,
            smart_things_sensor__capability__in=(
                Capability.CONTACT_SENSOR,
                Capability.MOTION_SENSOR
            )
        ),
        time_delta_generator=lambda at_time: timedelta(seconds=randint(1, 100) * (abs(12 - at_time.hour) + 1)),
        value_generator=lambda _: randint(0, 1)
    ),
    GeneratorConfig(
        filters=dict(
            child_type=Resource.ChildType.SMART_THINGS_SENSOR,
            smart_things_sensor__capability=Capability.BUTTON,
        ),
        time_delta_generator=lambda at_time: timedelta(seconds=randint(1, 100) * (abs(12 - at_time.hour) + 1)),
        value_generator=lambda _: randint(1, 3)
    ),
    GeneratorConfig(
        filters=dict(
            child_type=Resource.ChildType.SMART_THINGS_ENERGY_METER,
            smart_things_sensor__capability=Capability.POWER_METER,
        ),
        time_delta_generator=lambda _: timedelta(seconds=randint(1, 100)),
        value_generator=lambda at_time: (12 - abs(12 - at_time.hour)) * 100 + at_time.minute + randint(50, 400)
    ),
)


def gen_history():
    start_time = datetime.now(tz=timezone.utc) - timedelta(days=5)
    now = datetime.now(tz=timezone.utc)
    for generator_config in GENERATOR_CONFIGS:
        for resource in Resource.objects.filter(**generator_config.filters).all():
            if resource.get_latest_value():
                next_time = max(resource.get_latest_value().time, start_time)
            else:
                next_time = start_time

            print(f'processing for resource {resource.id}: {resource.name} ...')
            items_count = resource._live_data.count()

            while True:
                next_time += generator_config.time_delta_generator(next_time)

                if next_time > now:
                    break

                resource.add_value(ResourceValue(
                    time=next_time,
                    value=generator_config.value_generator(next_time),
                    unit=Unit.UNKNOWN
                ))

            print('new elements: ', resource._live_data.count() - items_count)
    print('Make long term history... (async)')
    select_resources_for_saving_values_to_long_term_history()


class Command(BaseCommand):
    def handle(self, *args, **options):
        gen_history()
