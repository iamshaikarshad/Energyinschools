# Generated by Django 2.1 on 2019-01-08 10:31

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Address',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('line_1', models.CharField(max_length=200)),
                ('line_2', models.CharField(max_length=200, null=True)),
                ('city', models.CharField(max_length=200, null=True)),
                ('post_code', models.CharField(max_length=20, null=True)),
                ('latitude', models.FloatField(default=51.51)),
                ('longitude', models.FloatField(default=-0.13)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]