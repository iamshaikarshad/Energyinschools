from django.contrib import admin

from apps.cashback.models import OffPeakyPoint
from apps.cashback.cashback_calculation import calculate_daily_cash_back_for_location


@admin.register(OffPeakyPoint)
class OffPeakyPointAdmin(OffPeakyPoint.get_model_admin()):
    change_form_template = 'admin_off_peaky_change_form.html'
    add_form_template = 'admin_off_peaky_add_form.html'

    def response_change(self, request, obj: OffPeakyPoint):
        self.calculate_value_on_demand(request, obj)
        return super().response_change(request, obj)

    @staticmethod
    def calculate_value_on_demand(request, obj: OffPeakyPoint):
        if 'calculate-off-peaky' in request.POST:
            obj.value = calculate_daily_cash_back_for_location(obj.location, obj.day)
            obj.save()
