from django.db import migrations

from apps.mug_service.constants import MUGMeterRatePeriod


def migrate_unit_rate_value(apps, schema_editor):
    EnergyMeterBillingInfo = apps.get_model("energy_meters_billing_info", "EnergyMeterBillingInfo")
    EnergyMeterBillingInfoUnitRate = apps.get_model("energy_meters_billing_info", "EnergyMeterBillingInfoUnitRate")

    EnergyMeterBillingInfoUnitRate.objects.bulk_create((
        EnergyMeterBillingInfoUnitRate(
            energy_meter_billing_info=entry,
            value=entry.unit_rate,
            unit_rate_period=MUGMeterRatePeriod.DAY
        ) for entry in EnergyMeterBillingInfo.objects.all()
    ))


def revert_migration(apps, schema_editor):
    EnergyMeterBillingInfoUnitRate = apps.get_model("energy_meters_billing_info", "EnergyMeterBillingInfoUnitRate")
    EnergyMeterBillingInfoUnitRate.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('energy_meters_billing_info', '0007_energymeterbillinginfounitrate'),
    ]

    operations = [
        migrations.RunPython(migrate_unit_rate_value, revert_migration),
        migrations.RemoveField(
            model_name='energymeterbillinginfo',
            name='unit_rate',
        ),
    ]
