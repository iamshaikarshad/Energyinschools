import uuid

from apps.energy_meters.models import EnergyMeter
from apps.energy_providers.models import EnergyProviderAccount
from apps.main.base_test_case import BaseTestCase


class EnergyProviderBaseTestCase(BaseTestCase):
    _energy_provider_id = None
    provider = EnergyProviderAccount.Provider.OVO

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls._energy_provider_id = cls.create_energy_provider(provider=cls.provider).id
        cls._energy_meter_id = cls.create_energy_meter(meter_id='the-meter-id').id

    @classmethod
    def create_energy_provider(cls, *, provider=EnergyProviderAccount.Provider.OVO, name=None):
        energy_provider = EnergyProviderAccount(
            provider=provider,
            credentials='{"login": "log", "password": "passsss"}',
            location=cls.get_user().location,
            name=name or 'the name',
            description='the description',
        )

        energy_provider.save()

        return energy_provider

    @classmethod
    def create_energy_meter(cls, *, name='', meter_id=None, type_=EnergyMeter.Type.ELECTRICITY, sub_location=None):
        energy_meter = EnergyMeter(
            meter_id=meter_id or uuid.uuid4(),
            type=type_,
            provider_account=EnergyProviderAccount.objects.get(id=cls._energy_provider_id),
            sub_location=sub_location or cls.get_user().location,
            name=name
        )
        energy_meter.save()

        return energy_meter

    @property
    def energy_provider(self) -> EnergyProviderAccount:
        return EnergyProviderAccount.objects.get(id=self._energy_provider_id)

    @property
    def energy_meter(self) -> EnergyMeter:
        return EnergyMeter.objects.get(id=self._energy_meter_id)
