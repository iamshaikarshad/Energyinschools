from django.contrib import admin
from apps.mug_service.models import Customer, Site, Meter, Switch

admin.site.register(Customer, Customer.get_model_admin())
admin.site.register(Site, Site.get_model_admin())
admin.site.register(Meter, Meter.get_model_admin())
admin.site.register(Switch, Switch.get_model_admin())
