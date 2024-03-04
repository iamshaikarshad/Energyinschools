# Generated by Django 2.1.5 on 2019-11-20 13:04

import apps.mug_service.constants
from django.db import migrations
import utilities.custom_serializer_fields


class Migration(migrations.Migration):

    dependencies = [
        ('energy_meters_billing_info', '0005_energymeterbillinginfo_supplier_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='energymeterbillinginfo',
            name='unit_rate_type',
            field=utilities.custom_serializer_fields.AutoLengthEnumField(default='Single', enum=apps.mug_service.constants.MUGMeterRateTypes, max_length=30),
        ),
        migrations.RemoveField(
            model_name='energymeterbillinginfo',
            name='annual_money_spend',
        ),
    ]
