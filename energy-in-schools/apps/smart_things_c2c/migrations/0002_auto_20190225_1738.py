# Generated by Django 2.1.5 on 2019-02-25 17:38

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('smart_things_c2c', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='c2cdevicetoenergymetermap',
            name='energy_meter',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='smart_things_c2c_mappers', to='energy_meters.EnergyMeter'),
        ),
    ]
