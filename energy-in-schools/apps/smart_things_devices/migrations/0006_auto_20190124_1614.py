# Generated by Django 2.1.5 on 2019-01-24 16:14

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('smart_things_devices', '0005_smartthingsdevice_deleted'),
    ]

    operations = [
        migrations.AlterField(
            model_name='smartthingsdevice',
            name='is_connected',
            field=models.BooleanField(default=True),
        ),
    ]
