# Generated by Django 2.1 on 2018-11-20 11:05

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('facts', '0002_auto_20180831_1602'),
    ]

    operations = [
        migrations.RenameField(
            model_name='fact',
            old_name='school',
            new_name='location',
        ),
    ]
