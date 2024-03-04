# Generated by Django 2.1.5 on 2019-12-09 19:30

import apps.energy_providers.providers.abstract
from django.db import migrations
import enumfields.fields


class Migration(migrations.Migration):

    dependencies = [
        ('smart_things_sensors', '0007_auto_20191204_2042'),
    ]

    operations = [
        migrations.AlterField(
            model_name='smartthingsenergymeter',
            name='type',
            field=enumfields.fields.EnumField(blank=True, default='SMART_PLUG', enum=apps.energy_providers.providers.abstract.MeterType, max_length=20),
        ),
    ]
