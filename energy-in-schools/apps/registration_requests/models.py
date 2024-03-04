from datetime import date, timedelta
from typing import Optional

from django.conf import settings
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.db import models
from encrypted_model_fields.fields import EncryptedCharField, EncryptedEmailField
from private_storage.fields import PrivateFileField

from apps.addresses.models import Address
from apps.locations.models import Location
from apps.locations.querysets import AbstractInLocationQuerySet
from apps.main.models import BaseModel
from apps.registration_requests.types import Decade, GovernanceType, LegalStatus, PupilsCountCategory, \
    RenewableEnergyType, SchoolType, Status
from utilities.custom_serializer_fields import AutoLengthEnumField
from utilities.private_files_utils import get_file_path_maker


TRIAL_DURATION = timedelta(days=365)


# noinspection PyArgumentList
class ContactInformation(BaseModel):
    class Meta:
        verbose_name_plural = "Contact information"

    first_name = EncryptedCharField(max_length=100, blank=True, null=True)
    last_name = EncryptedCharField(max_length=100, blank=True, null=True)
    job_role = EncryptedCharField(max_length=100, blank=True, null=True)
    email = EncryptedEmailField(max_length=100, blank=True, null=True)
    phone_number = EncryptedCharField(max_length=20, blank=True, null=True)
    company_name = EncryptedCharField(max_length=150, blank=True, null=True)


class RenewableEnergy(BaseModel):
    class Meta:
        verbose_name_plural = "Renewable energies"

    renewable_energy_type = AutoLengthEnumField(RenewableEnergyType, unique=True)


signed_loa_file_path = get_file_path_maker(settings.SINGED_LOA_STORAGE_FOLDER, 'signed_loa_file_path', __name__)


class Questionnaire(BaseModel):
    had_energy_audit = models.BooleanField()
    want_energy_audit = models.BooleanField()
    want_use_lessons_materials = models.BooleanField()
    want_install_energy_monitoring = models.BooleanField()
    want_participate_energy_management_interview = models.BooleanField()
    allow_smart_dcc_data_access_to_third_party = models.BooleanField(null=True)
    use_artificial_benchmark_for_first_year = models.BooleanField(null=True)

    signed_loa = PrivateFileField(
        upload_to=signed_loa_file_path,
        content_types=('pdf'),
        null=True
    )


class InLocationRegistrationRequestQuerySet(AbstractInLocationQuerySet):
    def in_location(self, location: Location):
        return self.filter(registered_school=location)


class RegistrationRequest(BaseModel):
    Status = Status

    objects = InLocationRegistrationRequestQuerySet.as_manager()

    email = models.EmailField(help_text='Credential of the new account will send to this email address')

    school_nickname = models.CharField(
        max_length=50,
        help_text='Letters, digits and _ only. Used as school member name prefix',
        validators=[UnicodeUsernameValidator()],
    )
    school_name = models.CharField(
        max_length=100,
        blank=False,
        help_text='Short name of the school'
    )
    address = models.OneToOneField(Address, on_delete=models.SET_NULL, null=True, blank=True)
    comment = models.TextField(null=True, blank=True)

    status = AutoLengthEnumField(Status, default=Status.TRIAL_PENDING)
    registration_reject_reason = models.TextField(null=True, blank=True)
    activation_reject_reason = models.TextField(null=True, blank=True)

    registered_school = models.OneToOneField(
        to=Location,
        on_delete=models.SET_NULL,
        null=True,
        related_name='registration_request',
    )

    school_manager = models.ForeignKey(
        to=ContactInformation,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='school_manager_registration_request'
    )
    utilities_manager = models.ForeignKey(
        to=ContactInformation,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='utilities_manager_registration_request'
    )
    it_manager = models.ForeignKey(
        to=ContactInformation,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='it_manager_registration_request',
    )

    governance_type = AutoLengthEnumField(GovernanceType, null=True, blank=True)
    pupils_count_category = AutoLengthEnumField(PupilsCountCategory, null=True, blank=True)
    campus_buildings_construction_decade = AutoLengthEnumField(Decade, null=True, blank=True)
    school_type = AutoLengthEnumField(SchoolType, null=True, blank=True)
    legal_status = AutoLengthEnumField(LegalStatus, null=True, blank=True)
    registration_number = models.CharField(max_length=20, null=True, blank=True)

    used_renewable_energies = models.ManyToManyField(RenewableEnergy, blank=True)
    electricity_provider = models.CharField(max_length=100, null=True, blank=True)
    gas_provider = models.CharField(max_length=100, null=True, blank=True)
    is_school_agreement_accepted = models.BooleanField(null=True)

    questionnaire = models.OneToOneField(Questionnaire, on_delete=models.CASCADE, null=True, blank=True)

    @property
    def trial_periods_ends_on(self) -> Optional[date]:
        if self.registered_school_id and \
                self.status in (self.Status.TRIAL_ACCEPTED, self.Status.ACTIVATION_PENDING):
            return (self.registered_school.created_at + TRIAL_DURATION).date()


class InLocationEnergyMeterBillingInfoQuerySet(AbstractInLocationQuerySet):
    def in_location(self, location: Location):
        return self.filter(registration_request__registered_school=location)
