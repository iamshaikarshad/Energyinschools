# Generated by Django 2.1.5 on 2021-09-10 16:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('energy_meters_billing_info', '0015_auto_20200218_1141'),
    ]

    operations = [
        migrations.AddField(
            model_name='energymeterbillinginfo',
            name='battery_capacity',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='energymeterbillinginfo',
            name='capacity_charge',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='energymeterbillinginfo',
            name='halfhourly_non_halfhourly',
            field=models.BooleanField(null=True),
        ),
        migrations.AddField(
            model_name='energymeterbillinginfo',
            name='has_solar',
            field=models.BooleanField(null=True),
        ),
        migrations.AddField(
            model_name='energymeterbillinginfo',
            name='is_battery_physical',
            field=models.BooleanField(null=True),
        ),
        migrations.AddField(
            model_name='energymeterbillinginfo',
            name='school_address',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
        migrations.AddField(
            model_name='energymeterbillinginfo',
            name='site_capacity',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='energymeterbillinginfo',
            name='solar_capacity',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='energymeterbillinginfo',
            name='tpi_name',
            field=models.CharField(max_length=100, null=True),
        ),
    ]