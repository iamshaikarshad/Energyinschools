# Generated by Django 2.1 on 2018-12-17 13:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('smart_things_sensors', '0002_import_temp_meters'),
    ]

    operations = [
        migrations.AlterField(
            model_name='smartthingssensor',
            name='events_subscription_id',
            field=models.CharField(db_index=True, max_length=50, null=True),
        ),
    ]