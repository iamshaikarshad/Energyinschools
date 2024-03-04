from django.apps import AppConfig


class LocationsConfig(AppConfig):
    name = 'apps.locations'

    def ready(self):
        # noinspection PyUnresolvedReferences
        import apps.locations.signals
