# Generated by Django 2.1 on 2019-01-08 10:55

import django.contrib.auth.validators
import django.db.models.deletion
import encrypted_model_fields.fields
from django.db import migrations, models
from enumfields import Enum

import apps.registration_requests.models
import apps.registration_requests.types
import utilities.custom_serializer_fields


class EnergyProvider(Enum):  # unused anymore
    UNKNOWN = 'unknown'
    OTHER = 'other'

    SSE = 'sse'
    BRITISH_GAS = 'british_gas'
    E_ON = 'e_on'
    OVO_ENERGY = 'ovo_energy'
    GOOD_ENERGY = 'good_energy'
    NPOWER = 'npower'


class Migration(migrations.Migration):
    dependencies = [
        ('locations', '0010_change_address_structure'),
        ('registration_requests', '0004_change_address_structure'),
    ]

    operations = [
        migrations.CreateModel(
            name='ContactInformation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('first_name', encrypted_model_fields.fields.EncryptedCharField(blank=True, null=True)),
                ('last_name', encrypted_model_fields.fields.EncryptedCharField(blank=True, null=True)),
                ('job_role', encrypted_model_fields.fields.EncryptedCharField(blank=True, null=True)),
                ('email', encrypted_model_fields.fields.EncryptedEmailField(blank=True, null=True)),
                ('phone_number', encrypted_model_fields.fields.EncryptedCharField(blank=True, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='RenewableEnergy',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('renewable_energy_type', utilities.custom_serializer_fields.AutoLengthEnumField(
                    enum=apps.registration_requests.types.RenewableEnergyType, max_length=10, unique=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.RenameField(
            model_name='registrationrequest',
            old_name='school_description',
            new_name='comment',
        ),
        migrations.AddField(
            model_name='registrationrequest',
            name='campus_buildings_construction_decade',
            field=utilities.custom_serializer_fields.AutoLengthEnumField(enum=apps.registration_requests.types.Decade,
                                                                         max_length=10, null=True),
        ),
        migrations.AddField(
            model_name='registrationrequest',
            name='electricity_provider',
            field=utilities.custom_serializer_fields.AutoLengthEnumField(
                enum=EnergyProvider, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='registrationrequest',
            name='gas_provider',
            field=utilities.custom_serializer_fields.AutoLengthEnumField(
                enum=EnergyProvider, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='registrationrequest',
            name='governance_type',
            field=utilities.custom_serializer_fields.AutoLengthEnumField(
                enum=apps.registration_requests.types.GovernanceType, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='registrationrequest',
            name='pupils_count_category',
            field=utilities.custom_serializer_fields.AutoLengthEnumField(
                enum=apps.registration_requests.types.PupilsCountCategory, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='registrationrequest',
            name='registered_school',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='locations.Location'),
        ),
        migrations.AddField(
            model_name='registrationrequest',
            name='registration_number',
            field=models.CharField(max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='registrationrequest',
            name='school_governor',
            field=utilities.custom_serializer_fields.AutoLengthEnumField(
                enum=apps.registration_requests.types.LegalStatus, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='registrationrequest',
            name='school_type',
            field=utilities.custom_serializer_fields.AutoLengthEnumField(enum=apps.registration_requests.types.SchoolType,
                                                                         max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='registrationrequest',
            name='school_nickname',
            field=models.CharField(help_text='Letters, digits and _ only. Used as school member name prefix',
                                   max_length=50,
                                   validators=[django.contrib.auth.validators.UnicodeUsernameValidator()]),
        ),
        migrations.AddField(
            model_name='registrationrequest',
            name='school_manager',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE,
                                    related_name='school_manager_registration_request',
                                    to='registration_requests.ContactInformation'),
        ),
        migrations.AddField(
            model_name='registrationrequest',
            name='used_renewable_energies',
            field=models.ManyToManyField(to='registration_requests.RenewableEnergy'),
        ),
        migrations.AddField(
            model_name='registrationrequest',
            name='utilities_manager',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE,
                                    related_name='utilities_manager_registration_request',
                                    to='registration_requests.ContactInformation'),
        ),
    ]