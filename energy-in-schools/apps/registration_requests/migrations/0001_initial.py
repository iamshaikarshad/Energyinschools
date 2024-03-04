# Generated by Django 2.0.5 on 2018-07-02 17:31

import django.contrib.auth.validators
import enumfields.fields
from django.db import migrations, models

import apps.registration_requests.models
import apps.registration_requests.types


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='RegistrationRequest',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('email', models.EmailField(help_text='Credential of the new account will send to this email address', max_length=254)),
                ('school_nickname', models.CharField(help_text='Letters, digits and @/./+/-/_ only. Used as school member name prefix', max_length=50, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()])),
                ('school_name', models.CharField(help_text='Short name of the school', max_length=100)),
                ('school_address', models.CharField(max_length=200)),
                ('school_description', models.TextField()),
                ('status',
                 enumfields.fields.EnumField(default='trial_pending', enum=apps.registration_requests.types.Status,
                                             max_length=10)),
                ('reject_reason', models.TextField(null=True)),
            ],
            options={
                'default_permissions': ('add', 'change', 'delete', 'retrieve'),
            },
        ),
    ]
