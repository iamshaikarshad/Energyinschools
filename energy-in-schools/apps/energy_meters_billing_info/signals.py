import logging

from django.dispatch import receiver
from django.db.models.signals import pre_delete

from apps.mug_service.models import Meter, Customer, Site
from apps.registration_requests.models import RegistrationRequest
from apps.energy_meters_billing_info.models import EnergyMeterBillingInfo
from apps.mug_service.constants import METER_TYPE__MUG_METER_TYPE__MAP
from apps.mug_service.api_client import MUGApiClient
from apps.mug_service.exceptions import MUGServiceDisabled


logger = logging.getLogger(__name__)


def handle_pre_delete_signal(instance: EnergyMeterBillingInfo):
    try:
        location = instance.location
        mug_customer_id = location.mug_customer.mug_customer_id
        mug_site_id = location.mug_site.mug_site_id
        mug_meter_id = instance.mug_meter.mug_meter_id

        if instance.fuel_type in METER_TYPE__MUG_METER_TYPE__MAP:
            meter_type = METER_TYPE__MUG_METER_TYPE__MAP[instance.fuel_type]
            MUGApiClient.request_delete_meter(customer_id=mug_customer_id,
                                              site_id=mug_site_id,
                                              meter_id=mug_meter_id,
                                              meter_type=meter_type)

    except (Customer.DoesNotExist, Site.DoesNotExist, Meter.DoesNotExist, RegistrationRequest.DoesNotExist):
        pass

    except MUGServiceDisabled:
        logger.info(f"MUG service disabled")


@receiver(pre_delete, sender=EnergyMeterBillingInfo, dispatch_uid='request_delete_meter')
def request_delete_meter(instance: EnergyMeterBillingInfo, **__):
    handle_pre_delete_signal(instance)
