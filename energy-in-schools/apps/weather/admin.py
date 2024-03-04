from django.contrib import admin

from apps.resources.admin import ResourceChildAdmin
from .models import WeatherTemperatureHistory


class WeatherTemperatureHistoryAdmin(WeatherTemperatureHistory.get_model_admin(), ResourceChildAdmin):
    pass


admin.site.register(WeatherTemperatureHistory, WeatherTemperatureHistoryAdmin)
