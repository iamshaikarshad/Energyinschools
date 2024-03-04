from django.urls import path, register_converter

from apps.microbit_devices.views import MicrobitDevicesView
from apps.smart_things_devices.types import Capability
from utilities.url_tools import get_converter_by_enum

# FIXME: this is added to backward compatibility with old code on raspberry hubs
extra_mapping = {
    'motion': Capability.MOTION_SENSOR,
    'temperature': Capability.TEMPERATURE
}

register_converter(get_converter_by_enum(Capability, extra_mapping), 'SmartThingsCapability')

urlpatterns = [
    path('<device_label>/<SmartThingsCapability:capability>/',
         MicrobitDevicesView.as_view({
             'post': 'post_command',
             'get': 'retrieve_state'
         })),
]
