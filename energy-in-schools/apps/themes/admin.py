from django.contrib import admin

from apps.themes.models import Theme


admin.site.register(Theme, Theme.get_model_admin())
