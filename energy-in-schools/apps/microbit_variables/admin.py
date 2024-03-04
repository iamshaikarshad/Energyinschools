from django.contrib import admin

from apps.microbit_variables.models import MicrobitVariable


# Register your models here.

admin.site.register(MicrobitVariable, MicrobitVariable.get_model_admin())
