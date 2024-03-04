from typing import Collection, Dict, NamedTuple

from apps.resources.types import DataCollectionMethod, InterpolationType, TimeResolution
from apps.smart_things_devices.types import Capability


class SensorConfig(NamedTuple):
    supported_data_collection_methods: Collection[DataCollectionMethod]
    preferred_data_collection_method: DataCollectionMethod
    detailed_time_resolution: TimeResolution
    interpolation_type: InterpolationType


SMART_THINGS_SENSOR_MAP: Dict[Capability, SensorConfig] = {
    Capability.TEMPERATURE: SensorConfig(
        supported_data_collection_methods=(DataCollectionMethod.PULL,),
        preferred_data_collection_method=DataCollectionMethod.PULL,
        detailed_time_resolution=TimeResolution.FIVE_MINUTES,
        interpolation_type=InterpolationType.LINEAR,
    ),
    Capability.BUTTON: SensorConfig(
        supported_data_collection_methods=(DataCollectionMethod.PUSH, DataCollectionMethod.PULL),
        preferred_data_collection_method=DataCollectionMethod.PUSH,
        detailed_time_resolution=TimeResolution.SECOND,
        interpolation_type=InterpolationType.DISABLED,
    ),
    Capability.MOTION_SENSOR: SensorConfig(
        supported_data_collection_methods=(DataCollectionMethod.PUSH, DataCollectionMethod.PULL),
        preferred_data_collection_method=DataCollectionMethod.PUSH,
        detailed_time_resolution=TimeResolution.SECOND,
        interpolation_type=InterpolationType.DISABLED,
    ),
    Capability.CONTACT_SENSOR: SensorConfig(
        supported_data_collection_methods=(DataCollectionMethod.PUSH, DataCollectionMethod.PULL),
        preferred_data_collection_method=DataCollectionMethod.PUSH,
        detailed_time_resolution=TimeResolution.SECOND,
        interpolation_type=InterpolationType.DISABLED,
    ),
    Capability.POWER_METER: SensorConfig(
        supported_data_collection_methods=(DataCollectionMethod.PULL, DataCollectionMethod.PUSH),
        preferred_data_collection_method=DataCollectionMethod.PUSH,
        detailed_time_resolution=TimeResolution.MINUTE,
        interpolation_type=InterpolationType.LINEAR,
    ),
}