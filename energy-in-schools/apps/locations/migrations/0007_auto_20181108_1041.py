# Generated by Django 2.1 on 2018-11-08 10:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('locations', '0006_location_is_test'),
    ]

    operations = [
        migrations.AddField(
            model_name='location',
            name='latitude',
            field=models.FloatField(null=True),
        ),
        migrations.AddField(
            model_name='location',
            name='longitude',
            field=models.FloatField(null=True),
        ),
    ]