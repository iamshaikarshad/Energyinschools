from rest_framework.viewsets import ViewSet

from apps.historical_data.utils.history_data_aggregation_mixin import HistoricalDataAction, ResourceHistoryMixin
from apps.locations.decorators import own_location_only
from apps.weather.models import WeatherTemperatureHistory
from apps.weather.serializers import WeatherTemperatureHistorySerializer, serializer_set


class WeatherHistoryViewSet(ResourceHistoryMixin, ViewSet):
    serializer_class = WeatherTemperatureHistorySerializer

    @own_location_only
    def get_queryset(self):
        return WeatherTemperatureHistory.objects.all()

    historical_values_single_resource = HistoricalDataAction(
        detail=False,
        url_path='temperatures',
        query_serializer_class=serializer_set.sequence
    )
