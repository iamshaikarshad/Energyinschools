from rest_framework import mixins
from rest_framework.viewsets import GenericViewSet

from apps.hubs.authentication import RaspberryPiAuthentication
from apps.microbit_historical_data.models import MicrobitHistoricalDataSet
from apps.microbit_historical_data.serializers import MicrobitHistoricalDataAddDataSerializer
from apps.resources.types import ResourceValue


class MicrobitHistoricalDataSetView(mixins.CreateModelMixin,
                                    GenericViewSet):
    authentication_classes = RaspberryPiAuthentication,
    serializer_class = MicrobitHistoricalDataAddDataSerializer

    def get_queryset(self):
        return MicrobitHistoricalDataSet.objects.filter(sub_location=self.request.auth.location)

    def perform_create(self, serializer: MicrobitHistoricalDataAddDataSerializer):
        data_set, _ = MicrobitHistoricalDataSet.objects.update_or_create(
            defaults=dict(unit_label=serializer.validated_data['unit']),
            namespace=serializer.validated_data['namespace'],
            name=serializer.validated_data['name'],
            type=serializer.validated_data['type'],
            hub=self.request.auth.raspberry_hub,
            sub_location=self.request.auth.raspberry_hub.sub_location,
        )

        data_set.add_value(ResourceValue(
            time=serializer.validated_data['time'].replace(microsecond=0),
            value=serializer.validated_data['value'],
            unit=serializer.validated_data['unit'],
        ))
