# Generated by Django 2.1.5 on 2019-09-04 09:53

import apps.lesson_plans.models
from django.db import migrations
import private_storage.fields
import private_storage.storage.files


class Migration(migrations.Migration):

    dependencies = [
        ('lesson_plans', '0013_auto_20190903_1258'),
    ]

    operations = [
        migrations.AddField(
            model_name='lessongroup',
            name='materials',
            field=private_storage.fields.PrivateFileField(blank=True, null=True, storage=private_storage.storage.files.PrivateFileSystemStorage(), upload_to=apps.lesson_plans.models.lesson_group_materials_file_path, verbose_name='Lesson group materials file'),
        ),
    ]