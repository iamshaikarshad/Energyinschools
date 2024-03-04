import logging

from django.contrib import admin, messages
from django.http import HttpResponseRedirect

from apps.mug_service.models import Customer
from apps.registration_requests.models import RegistrationRequest, ContactInformation,\
    RenewableEnergy, Questionnaire

logger = logging.getLogger(__name__)

@admin.register(RegistrationRequest)
class RegistrationRequestAdmin(RegistrationRequest.get_model_admin()):
    list_display = ['id', 'school_nickname', 'school_name', 'status', 'registered_school_id']
    list_filter = ['status']
    change_form_template = 'admin_registration_request_change_form.html'

    def save_model(self, request, obj, form, change):
        try:
            super().save_model(request, obj, form, change)
        except Exception as e:
            logger.error(f'Error saving registration request model: {e}')
            print(f'Error saving registration request model: {e}')

    def response_change(self, request, registration_request: RegistrationRequest):
        try:
            if '_add_mug_customer' in request.POST:
                if Customer.create_from_registration_request(registration_request):
                    messages.add_message(request, messages.SUCCESS, f"MUG Customer for '{registration_request.school_name}' "
                                                                "school was created!")
                else:
                    messages.add_message(request, messages.ERROR, 'MUG Customer wasn\'t created')
                return HttpResponseRedirect(request.path)
            return super().response_change(request, registration_request)
        except Exception as e:
            logger.error(f'response_change fails with error: {e}')
            return super().response_change(request, registration_request)

    def change_view(self, request, object_id, form_url='', extra_context=None):
        extra_context = extra_context or {}
        registration_request = RegistrationRequest.objects.get(pk=object_id)
        customer_exists = Customer.objects.filter(registration_request=registration_request).exists()
        extra_context['disabled'] = 'disabled' if customer_exists or not registration_request.registered_school else ''
        return super().change_view(
            request, object_id, form_url, extra_context=extra_context,
        )


admin.site.register(ContactInformation, ContactInformation.get_model_admin())
admin.site.register(RenewableEnergy, RenewableEnergy.get_model_admin())
admin.site.register(Questionnaire, Questionnaire.get_model_admin())
