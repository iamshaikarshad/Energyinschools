from django.contrib import admin

from apps.dashboard_app_files.models import DashboardApp


admin.site.register(DashboardApp, DashboardApp.get_model_admin())