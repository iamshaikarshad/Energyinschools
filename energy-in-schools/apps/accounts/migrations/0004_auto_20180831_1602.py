# Generated by Django 2.1 on 2018-08-31 16:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_auto_20180724_1147'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='user',
            options={'permissions': (('manage_sme_admins', 'Can manage SME admins'), ('manage_teachers', 'Can manage teachers'), ('manage_pupils', 'Can manage pupils'), ('manage_energy_screen', 'Can manage energy screen')), 'verbose_name': 'User', 'verbose_name_plural': 'Users'},
        ),
    ]