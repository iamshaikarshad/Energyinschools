# Generated by Django 2.2.28 on 2022-05-28 12:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('smart_things_devices', '0009_smartthingsdevice_battery_health'),
    ]

    operations = [
        migrations.AddField(
            model_name='smartthingsdevice',
            name='deleted_by_cascade',
            field=models.BooleanField(default=False, editable=False),
        ),
    ]
