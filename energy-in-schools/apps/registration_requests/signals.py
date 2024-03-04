import logging

from apps.registration_requests.models import RegistrationRequest
from apps.registration_requests.types import Status
from apps.mug_service.models import Customer, Site
from apps.mug_service.api_client import MUGApiClient
from apps.mug_service.internal_types import MUGCustomerParams
from apps.mug_service.exceptions import MUGServiceDisabled

from django.db.models.signals import post_save
from django.dispatch import receiver


logger = logging.getLogger(__name__)


@receiver(post_save, sender=RegistrationRequest, dispatch_uid='create_mug_customer')
def create_mug_customer(instance: RegistrationRequest, **__):
    if instance.status == Status.TRIAL_ACCEPTED and not Customer.objects.filter(registration_request=instance).exists():
        try:
            customer_json = MUGCustomerParams.from_registration_request(instance).to_json()
            mug_customer_id = MUGApiClient.request_add_customer(customer_json)
            Customer.objects.create(
                registration_request=instance,
                mug_customer_id=mug_customer_id,
            )

            # Creation MUG site for parent location
            Site.create_from_location(instance.registered_school)
        except MUGServiceDisabled:
            logger.info("MUG service disabled")
