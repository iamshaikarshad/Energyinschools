# Generated by Django 2.1 on 2018-12-12 12:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('smart_things_devices', '0002_auto_20181212_1209'),
    ]

    operations = [
        migrations.AlterField(
            model_name='smartthingscapability',
            name='capability',
            field=models.CharField(db_index=True, max_length=100, unique=True),
        ),
    ]
