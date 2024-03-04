# Generated by Django 2.1.5 on 2021-05-31 14:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('energy_dashboard', '0003_auto_20191216_1206'),
    ]

    operations = [
        migrations.CreateModel(
            name='Tip',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('text', models.TextField(max_length=500)),
                ('school_name', models.TextField(max_length=500)),
                ('city', models.TextField(blank=True, max_length=500, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
