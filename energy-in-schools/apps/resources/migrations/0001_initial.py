# Generated by Django 2.1 on 2018-11-06 17:02

import datetime

import django.contrib.postgres.fields
import django.db.models.deletion
import enumfields.fields
from django.db import migrations, models

import apps.resources.models
import apps.resources.types


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('locations', '0005_auto_20180831_1602'),
    ]

    operations = [
        migrations.CreateModel(
            name='Resource',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('child_type', enumfields.fields.EnumField(enum=apps.resources.types.ResourceChildType, max_length=40)),
                ('supported_data_collection_methods', django.contrib.postgres.fields.ArrayField(
                    base_field=enumfields.fields.EnumField(enum=apps.resources.types.DataCollectionMethod,
                                                           max_length=10), size=None)),
                ('preferred_data_collection_method',
                 enumfields.fields.EnumField(enum=apps.resources.types.DataCollectionMethod, max_length=10)),
                ('unit', enumfields.fields.EnumField(enum=apps.resources.types.Unit, max_length=20)),
                ('detailed_time_resolution',
                 enumfields.fields.EnumField(enum=apps.resources.types.TimeResolution, max_length=20)),
                ('long_term_time_resolution',
                 enumfields.fields.EnumField(enum=apps.resources.types.TimeResolution, max_length=20)),
                ('detailed_data_live_time', models.DurationField(default=datetime.timedelta(4))),
                ('sub_location', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='locations.Location')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
