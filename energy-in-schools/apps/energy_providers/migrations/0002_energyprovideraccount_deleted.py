# Generated by Django 2.1.5 on 2019-01-25 14:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('energy_providers', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='energyprovideraccount',
            name='deleted',
            field=models.DateTimeField(db_column='deleted_at', editable=False, null=True),
        ),
    ]
