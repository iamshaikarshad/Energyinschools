from django.contrib import admin

# Register your models here.
from apps.energy_dashboard.models import (
    DashboardScreen, DashboardMessage, DashboardPing, Tip
)

admin.site.register(DashboardScreen, DashboardScreen.get_model_admin())
admin.site.register(DashboardMessage, DashboardMessage.get_model_admin())
admin.site.register(DashboardPing, DashboardPing.get_model_admin())
admin.site.register(Tip, Tip.get_model_admin())
