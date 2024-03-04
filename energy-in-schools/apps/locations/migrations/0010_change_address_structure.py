# Generated by Django 2.1 on 2019-01-04 14:24

from django.db import migrations, models

from apps.addresses.models import Address
from apps.locations.models import Location


def migrate_address_to_new_structure(apps, schema_editor):
    location_class: Location = apps.get_model('locations', 'Location')
    address_class: Address = apps.get_model('addresses', 'Address')

    for location in location_class.objects.filter(parent_location=None):
        location.address = address_class.objects.create(
            line_1=location.line_1,
            line_2=None,
            city=None,
            post_code=None,
            latitude=location.latitude,
            longitude=location.longitude,
        )
        location.save()


class Migration(migrations.Migration):
    dependencies = [
        ('locations', '0009_auto_20181116_1358'),
        ('addresses', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='location',
            old_name='address',
            new_name='line_1',
        ),
        migrations.AddField(
            model_name='location',
            name='address',
            field=models.OneToOneField(null=True, on_delete=models.deletion.SET_NULL, to='addresses.Address'),
        ),
        migrations.RunPython(
            code=migrate_address_to_new_structure
        ),
        migrations.RemoveField(
            model_name='location',
            name='line_1',
        ),
        migrations.RemoveField(
            model_name='location',
            name='latitude',
        ),
        migrations.RemoveField(
            model_name='location',
            name='longitude',
        ),
    ]
