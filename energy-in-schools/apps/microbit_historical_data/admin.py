from django.contrib import admin

from apps.microbit_historical_data.models import MicrobitHistoricalDataSet
from apps.resources.admin import ResourceChildAdmin


class MicrobitHistoricalDataSetAdmin(MicrobitHistoricalDataSet.get_model_admin(), ResourceChildAdmin):
    pass


admin.site.register(MicrobitHistoricalDataSet, MicrobitHistoricalDataSetAdmin)
