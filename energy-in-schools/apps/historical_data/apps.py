from django.apps import AppConfig


class HistoricalDataConfig(AppConfig):
    name = 'apps.historical_data'

    def ready(self):
        # noinspection PyUnresolvedReferences
        import apps.historical_data.aggregation_params   # register aggregation params
