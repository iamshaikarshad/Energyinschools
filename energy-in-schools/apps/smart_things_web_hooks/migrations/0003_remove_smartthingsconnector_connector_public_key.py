# Generated by Django 2.1.5 on 2021-01-20 08:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('smart_things_web_hooks', '0002_auto_20181026_0909'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='smartthingsconnector',
            name='connector_public_key',
        ),
    ]