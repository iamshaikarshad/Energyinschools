# Generated by Django 2.1.5 on 2020-02-18 13:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mug_service', '0005_auto_20191225_1553'),
    ]

    operations = [
        migrations.AddField(
            model_name='switch',
            name='to_peak_unit_rate',
            field=models.FloatField(default=0.0),
        ),
    ]
