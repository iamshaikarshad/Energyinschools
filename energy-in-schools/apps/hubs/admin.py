from django.contrib import admin

from apps.hubs.models import Hub


# Register your models here.
admin.site.register(Hub, Hub.get_model_admin())
