# Generated by Django 2.1.5 on 2020-02-04 09:56

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('weather', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='weathertemperaturehistory',
            options={'verbose_name_plural': 'Weather temperature history'},
        ),
    ]
