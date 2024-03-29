# Generated by Django 2.1 on 2018-10-10 10:16

from django.db import migrations
import enumfields.fields
import apps.notifications.models.notification_triggers


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0003_auto_20181004_1329'),
    ]

    operations = [
        migrations.AddField(
            model_name='notificationtrigger',
            name='active_days',
            field=enumfields.fields.EnumField(default='all_days', enum=apps.notifications.models.notification_triggers.ActiveDays, max_length=20),
        ),
    ]
