from django.contrib import admin

from apps.smart_things_web_hooks.models import SmartThingsConnector


admin.site.register(SmartThingsConnector, SmartThingsConnector.get_model_admin())
