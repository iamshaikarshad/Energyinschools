from django.contrib import admin

from apps.smart_things_apps.models import SmartThingsApp


admin.site.register(SmartThingsApp, SmartThingsApp.get_model_admin())
