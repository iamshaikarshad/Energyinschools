# Generated by Django 2.1.5 on 2019-04-05 15:05

import apps.manuals.models
from django.db import migrations
import private_storage.fields
import private_storage.storage.files


class Migration(migrations.Migration):

    dependencies = [
        ('manuals', '0002_manualmediafile_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='manual',
            name='avatar',
            field=private_storage.fields.PrivateFileField(blank=True, null=True, storage=private_storage.storage.files.PrivateFileSystemStorage(), upload_to=apps.manuals.models.manuals_avatars_file_path, verbose_name='Avatar'),
        ),
    ]