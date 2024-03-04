# Generated by Django 2.1.5 on 2020-02-03 15:29

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('energy_meters_billing_info', '0012_remove_energymeterbillinginfo_annual_consumption'),
    ]

    operations = [
        migrations.AlterField(
            model_name='energymeterbillinginfo',
            name='contract_starts_on',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='energymeterbillinginfoconsumption',
            name='consumption',
            field=models.FloatField(validators=[django.core.validators.MinValueValidator(1.0)]),
        ),
    ]