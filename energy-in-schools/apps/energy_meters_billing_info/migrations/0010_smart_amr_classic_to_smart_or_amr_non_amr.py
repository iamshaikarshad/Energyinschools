from django.db import migrations, models

from apps.energy_meters_billing_info.models import UsedMeterType
import utilities.custom_serializer_fields


def migrate_to_new_meter_types(apps, schema_editor):
    EnergyMeterBillingInfo = apps.get_model("energy_meters_billing_info", "EnergyMeterBillingInfo")
    smart_or_amr = EnergyMeterBillingInfo.objects.filter(meter_type__in=['smart', 'amr'])
    non_amr = EnergyMeterBillingInfo.objects.filter(meter_type='classic')

    smart_or_amr.update(meter_type=UsedMeterType.SMART_OR_AMR.value)
    non_amr.update(meter_type=UsedMeterType.NON_AMR.value)


class Migration(migrations.Migration):

    dependencies = [
        ('energy_meters_billing_info', '0009_auto_20191126_1131'),
    ]

    operations = [
        migrations.AlterField(
            model_name='energymeterbillinginfo',
            name='meter_type',
            field=models.CharField(max_length=100),
        ),
        migrations.RunPython(migrate_to_new_meter_types, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='energymeterbillinginfo',
            name='meter_type',
            field=utilities.custom_serializer_fields.AutoLengthEnumField(enum=UsedMeterType, max_length=20),
        ),
    ]
