from django.core.management import BaseCommand

from apps.smart_things_devices.models import SmartThingsCapability, SmartThingsDevice
from apps.smart_things_devices.types import Capability


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('device_id', type=str, default='fake')

    def handle(self, *args, device_id='fake', **options):
        fake_device, _ = SmartThingsDevice.objects.get_or_create(
            smart_things_id=device_id,
            sub_location_id=1,
            defaults=dict(
                name=device_id,
                label=device_id,
                is_connected=True,
                smart_things_location='fake',
            )
        )
        fake_device.capabilities.set([
            SmartThingsCapability.objects.get_or_create(capability=capability.value)[0]
            for capability in [
                Capability.MOTION_SENSOR,
                Capability.TEMPERATURE,
                Capability.CONTACT_SENSOR,
                Capability.BUTTON,
                Capability.POWER_METER,
                Capability.ENERGY_METER,
            ]
        ])
        fake_device.save()
