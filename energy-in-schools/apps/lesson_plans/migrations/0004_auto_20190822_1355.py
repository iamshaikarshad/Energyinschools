# Generated by Django 2.1.5 on 2019-08-22 13:55

import apps.lesson_plans.models
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('lesson_plans', '0003_auto_20190822_1354'),
    ]

    operations = [
        migrations.CreateModel(
            name='LessonGroup',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('title', models.CharField(max_length=100)),
                ('overview', models.CharField(max_length=512)),
                ('group_avatar', models.FileField(blank=True, null=True, upload_to=apps.lesson_plans.models.lesson_avatar_file_path, verbose_name='Lesson group avatar')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='lessonplan',
            name='lesson_group',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='lesson_plans.LessonGroup'),
        ),
    ]