# Generated by Django 2.1.5 on 2019-06-05 09:07

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0010_fix_long_term_history_time'),
        ('energy_meters_billing_info', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='energymeterbillinginfo',
            name='resource',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='energy_meter_billing_info', to='resources.Resource'),
        ),
    ]