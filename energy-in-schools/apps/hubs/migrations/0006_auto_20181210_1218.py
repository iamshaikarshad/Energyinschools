# Generated by Django 2.1 on 2018-12-10 12:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('hubs', '0005_auto_20181130_1255'),
    ]

    operations = [
        migrations.RenameField(
            model_name='raspberryhub',
            old_name='location',
            new_name='sub_location',
        ),
    ]
