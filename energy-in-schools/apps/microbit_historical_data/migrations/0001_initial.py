# Generated by Django 2.1 on 2018-11-07 17:17

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('hubs', '0004_auto_20180831_1602'),
        ('resources', '0003_auto_20181107_1629'),
    ]

    operations = [
        migrations.CreateModel(
            name='MicrobitHistoricalDataSet',
            fields=[
                ('resource_ptr', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, related_name='microbit_historical_data_set', serialize=False, to='resources.Resource')),
                ('namespace', models.CharField(db_index=True, max_length=100)),
                ('type', models.IntegerField(db_index=True)),
                ('unit_label', models.CharField(max_length=20)),
                ('hub', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='hubs.RaspberryHub')),
            ],
            options={
                'abstract': False,
            },
            bases=('resources.resource',),
        ),
    ]
