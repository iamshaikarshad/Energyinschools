# Generated by Django 2.0.5 on 2018-07-24 15:01

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('themes', '0001_initial'),
        ('locations', '0002_auto_20180704_1820'),
    ]

    operations = [
        migrations.AddField(
            model_name='location',
            name='current_theme',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='themes.Theme'),
        ),
    ]
