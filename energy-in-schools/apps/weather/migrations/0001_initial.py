# Generated by Django 2.1 on 2018-11-08 15:11

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('resources', '0003_auto_20181107_1629'),
    ]

    operations = [
        migrations.CreateModel(
            name='WeatherTemperatureHistory',
            fields=[
                ('resource_ptr', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, related_name='weather_temperature', serialize=False, to='resources.Resource')),
            ],
            options={
                'abstract': False,
            },
            bases=('resources.resource',),
        ),
    ]
