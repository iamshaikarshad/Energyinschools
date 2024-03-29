# Generated by Django 2.1.5 on 2020-02-03 15:29

import apps.registration_requests.types
from django.db import migrations, models
import django.db.models.deletion
import utilities.custom_serializer_fields


class Migration(migrations.Migration):

    dependencies = [
        ('registration_requests', '0016_auto_20190730_1531'),
    ]

    operations = [
        migrations.AlterField(
            model_name='registrationrequest',
            name='address',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='addresses.Address'),
        ),
        migrations.AlterField(
            model_name='registrationrequest',
            name='campus_buildings_construction_decade',
            field=utilities.custom_serializer_fields.AutoLengthEnumField(blank=True, enum=apps.registration_requests.types.Decade, max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='registrationrequest',
            name='electricity_provider',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='registrationrequest',
            name='gas_provider',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='registrationrequest',
            name='governance_type',
            field=utilities.custom_serializer_fields.AutoLengthEnumField(blank=True, enum=apps.registration_requests.types.GovernanceType, max_length=30, null=True),
        ),
        migrations.AlterField(
            model_name='registrationrequest',
            name='legal_status',
            field=utilities.custom_serializer_fields.AutoLengthEnumField(blank=True, enum=apps.registration_requests.types.LegalStatus, max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='registrationrequest',
            name='pupils_count_category',
            field=utilities.custom_serializer_fields.AutoLengthEnumField(blank=True, enum=apps.registration_requests.types.PupilsCountCategory, max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='registrationrequest',
            name='school_type',
            field=utilities.custom_serializer_fields.AutoLengthEnumField(blank=True, enum=apps.registration_requests.types.SchoolType, max_length=10, null=True),
        ),
    ]
