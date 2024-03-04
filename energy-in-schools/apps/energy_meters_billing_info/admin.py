import logging
from django.contrib import admin, messages
from django.http import HttpResponseRedirect

from apps.energy_meters_billing_info.models import EnergyMeterBillingInfo, EnergyMeterBillingInfoConsumption
from apps.mug_service.models import Meter

logger = logging.getLogger(__name__)

@admin.register(EnergyMeterBillingInfo)
class EnergyMeterBillingInfoAdmin(EnergyMeterBillingInfo.get_model_admin()):
    change_form_template = 'admin_meter_info_change_form.html'

    def response_change(self, request, energy_meter_billing_info: EnergyMeterBillingInfo):
        if '_add_mug_meter' in request.POST:
            try:
                if Meter.create_from_energy_meter_billing_info(energy_meter_billing_info):
                    messages.add_message(request, messages.SUCCESS, f"MUG Meter for '{energy_meter_billing_info.meter_id}' "
                                                                    "meter was created!")
                else:
                    messages.add_message(request, messages.ERROR, 'MUG Meter wasn\'t created')
            except Exception as error:
                logger.error(f"error: {error}")
                
            return HttpResponseRedirect(request.path)
        return super().response_change(request, energy_meter_billing_info)

    def change_view(self, request, object_id, form_url='', extra_context=None):
        extra_context = extra_context or {}
        energy_meter_billing_info = EnergyMeterBillingInfo.objects.get(pk=object_id)
        meter_exist = Meter.objects.filter(energy_meter_billing_info=energy_meter_billing_info).exists()
        extra_context['disabled'] = 'disabled' if meter_exist else ''
        return super().change_view(
            request, object_id, form_url, extra_context=extra_context,
        )


@admin.register(EnergyMeterBillingInfoConsumption)
class EnergyMeterBillingInfoConsumptionAdmin(EnergyMeterBillingInfoConsumption.get_model_admin()):

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ('unit_rate_period', )
        return self.readonly_fields
