# Generated by Django 2.1.5 on 2019-08-23 11:06

import apps.lesson_plans.models
from django.db import migrations, models
import tinymce.models


class Migration(migrations.Migration):

    dependencies = [
        ('lesson_plans', '0004_auto_20190822_1355'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lessongroup',
            name='group_avatar',
            field=models.FileField(blank=True, null=True, upload_to=apps.lesson_plans.models.lesson_group_avatar_file_path, verbose_name='Lesson group avatar'),
        ),
        migrations.AlterField(
            model_name='lessonplan',
            name='content',
            field=tinymce.models.HTMLField(blank=True, null=True),
        ),
    ]