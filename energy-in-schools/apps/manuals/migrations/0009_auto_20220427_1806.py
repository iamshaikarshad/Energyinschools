# Generated by Django 2.2.28 on 2022-04-27 18:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('manuals', '0008_auto_20190502_1249'),
    ]

    operations = [
        migrations.AlterField(
            model_name='manual',
            name='avatar_image',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
        migrations.AlterField(
            model_name='manual',
            name='avatar_video',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
        migrations.AlterField(
            model_name='manualmediafile',
            name='media_file',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
    ]
