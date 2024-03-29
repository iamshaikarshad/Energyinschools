# Generated by Django 2.1 on 2018-11-30 12:55

from django.db import migrations, models
import utilities.alphanumeric


class Migration(migrations.Migration):

    dependencies = [
        ('hubs', '0004_auto_20180831_1602'),
    ]

    operations = [
        migrations.AlterField(
            model_name='raspberryhub',
            name='uid',
            field=models.CharField(db_index=True, default=utilities.alphanumeric.generate_alphanumeric, max_length=5, unique=True),
        ),
    ]
