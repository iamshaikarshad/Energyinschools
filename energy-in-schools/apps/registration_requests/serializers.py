from typing import Any, Dict, Optional, Type

from django.core.validators import MinLengthValidator
from django.db.models import Model, Q
from django.db.transaction import atomic
from enumfields.drf import EnumSupportSerializerMixin
from rest_framework import serializers
from rest_framework.validators import UniqueValidator, qs_filter

from apps.accounts.models import User
from apps.accounts.permissions import RoleName
from apps.addresses.models import Address
from apps.addresses.serializers import AddressSerializer
from apps.registration_requests.models import ContactInformation, Questionnaire, \
    RegistrationRequest, RenewableEnergy
from utilities.serializer_helpers import get_serializer_fields, get_serializer_kwargs


class UniqueSchoolNickNameValidator(UniqueValidator):
    @staticmethod
    def filter_queryset(value, queryset, *_):
        return qs_filter(queryset, username=User.make_school_member_username(value, RoleName.SLE_ADMIN))


class ContactInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInformation
        fields = get_serializer_fields(
            model.first_name,
            model.last_name,
            model.job_role,
            model.email,
            model.company_name,
            model.phone_number,
            add_id=False,
        )

        extra_kwargs = get_serializer_kwargs({
            model.phone_number: {'required': False},
        })


class RenewableEnergySerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = RenewableEnergy
        fields = get_serializer_fields(
            model.renewable_energy_type,
            add_id=False,
        )

    def __init__(self, *args, **kwargs):
        for index, validator in enumerate(self.fields['renewable_energy_type'].validators):
            if isinstance(validator, UniqueValidator):
                # unique validator fails in RegistrationRequestSerializer
                del self.fields['renewable_energy_type'].validators[index]
                break

        super().__init__(*args, **kwargs)


class QuestionnaireSerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Questionnaire
        fields = get_serializer_fields(
            model.had_energy_audit,
            model.want_energy_audit,
            model.want_use_lessons_materials,
            model.want_install_energy_monitoring,
            model.want_participate_energy_management_interview,
            model.allow_smart_dcc_data_access_to_third_party,
            model.use_artificial_benchmark_for_first_year,
            model.signed_loa,
            add_id=False,
        )


class RegistrationRequestSerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):
    school_manager = ContactInformationSerializer()
    utilities_manager = ContactInformationSerializer(allow_null=True)
    it_manager = ContactInformationSerializer(required=False, allow_null=True)
    used_renewable_energies = RenewableEnergySerializer(many=True)
    address = AddressSerializer()
    questionnaire = QuestionnaireSerializer(read_only=True)
    trial_periods_ends_on = serializers.DateField(read_only=True)

    class Meta:
        model = RegistrationRequest
        fields = get_serializer_fields(
            model.email,
            model.school_nickname,
            model.school_name,
            'address',
            model.comment,
            model.status,
            model.registration_reject_reason,
            model.activation_reject_reason,
            model.created_at,
            model.updated_at,

            model.registered_school,
            'school_manager',
            'utilities_manager',
            'it_manager',
            model.governance_type,
            model.pupils_count_category,
            model.campus_buildings_construction_decade,
            model.school_type,
            model.legal_status,
            model.registration_number,
            'used_renewable_energies',
            model.electricity_provider,
            model.gas_provider,
            model.is_school_agreement_accepted,
            'trial_periods_ends_on',
            'questionnaire',
        )

        extra_kwargs = get_serializer_kwargs({
            model.email: {'validators': [
                # only if the school wasn't created in our system:
                UniqueValidator(queryset=model.objects.filter(~Q(status=model.Status.TRIAL_REJECTED))),
            ]},
            model.school_nickname: {'validators': [UniqueSchoolNickNameValidator(queryset=User.objects.all())]},
            model.status: {'read_only': True},
            model.registration_reject_reason: {'read_only': True},
            model.created_at: {'read_only': True},
            model.updated_at: {'read_only': True},

            model.governance_type: {},
            model.pupils_count_category: {},
            model.campus_buildings_construction_decade: {'allow_null': True},
            model.school_type: {},
            model.legal_status: {'allow_null': True},
            model.registration_number: {'allow_null': True},
            model.electricity_provider: {},
            model.gas_provider: {'allow_null': True},
            model.comment: {'allow_null': True, 'allow_blank': True},
            model.is_school_agreement_accepted: {'required': True},
        })

    @staticmethod
    def validate_is_school_agreement_accepted(value):
        if not value:
            raise serializers.ValidationError("The agreement should be accepted!")

        return value

    @atomic
    def create(self, validated_data: Dict[str, Any]) -> Meta.model:
        used_renewable_energies = validated_data.pop('used_renewable_energies')

        instance = self.Meta.model.objects.create(
            school_manager=ContactInformation.objects.create(**validated_data.pop('school_manager')),
            utilities_manager=self._create_nested(ContactInformation, validated_data.pop('utilities_manager', None)),
            it_manager=self._create_nested(ContactInformation, validated_data.pop('it_manager', None)),
            address=Address.objects.create(**validated_data.pop('address')),
            **validated_data
        )

        instance.used_renewable_energies.set((
            RenewableEnergy.objects.get_or_create(**used_renewable_energy)[0]
            for used_renewable_energy in used_renewable_energies
        ))
        instance.save()

        return instance

    @staticmethod
    def _create_nested(model_class: Type[Model], parameters: Optional[Dict[str, Any]]) -> Optional[Model]:
        if parameters:
            return model_class.objects.create(**parameters)


class RegistrationRequestEmptySerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationRequest
        fields = ()


class DeclineRegistrationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationRequest
        fields = get_serializer_fields(
            RegistrationRequest.registration_reject_reason,
        )

        extra_kwargs = get_serializer_kwargs({
            RegistrationRequest.registration_reject_reason: {
                'allow_null': False,
                'required': True,
                'validators': [MinLengthValidator(10)]
            }
        })


class DeclineActivationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationRequest
        fields = get_serializer_fields(
            RegistrationRequest.activation_reject_reason,
        )

        extra_kwargs = get_serializer_kwargs({
            RegistrationRequest.activation_reject_reason: {
                'required': True,
                'allow_null': False,
                'validators': [MinLengthValidator(10)],
            }
        })
