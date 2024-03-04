from django.contrib import admin

from apps.addresses.models import Address


admin.site.register(Address, Address.get_model_admin())
