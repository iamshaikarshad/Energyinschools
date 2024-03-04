# Generated by Django 2.1.5 on 2019-03-04 16:55

import apps.resources.types
import apps.smart_things_devices.types
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('energy_tariffs', '0005_auto_20190227_1447'),
    ]

    operations = [
        migrations.AlterField(
            model_name='energytariff',
            name='resource',
            field=models.ForeignKey(blank=True, limit_choices_to=models.Q(models.Q(('child_type', apps.resources.types.ResourceChildType('energy_meter')), models.Q(('child_type', apps.resources.types.ResourceChildType('smart_things_sensor')), ('smart_things_sensor__capability', apps.smart_things_devices.types.Capability('powerMeter')), ('smart_things_sensor__device__capabilities__capability', 'energyMeter')), _connector='OR')), null=True, on_delete=django.db.models.deletion.CASCADE, to='resources.Resource'),
        ),
    ]
