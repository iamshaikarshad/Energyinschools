from django.contrib import admin

from apps.facts.models import Fact


admin.site.register(Fact, Fact.get_model_admin())
