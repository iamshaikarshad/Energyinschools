# Generated by Django 2.1 on 2018-12-26 17:15

from django.db import migrations
import apps.smart_things_devices.types
import utilities.custom_serializer_fields


class Migration(migrations.Migration):

    dependencies = [
        ('smart_things_sensors', '0003_auto_20181217_1310'),
    ]

    operations = [
        migrations.AlterField(
            model_name='smartthingssensor',
            name='capability',
            field=utilities.custom_serializer_fields.AutoLengthEnumField(db_index=True, editable=False, enum=apps.smart_things_devices.types.Capability, max_length=30),
        ),
    ]
