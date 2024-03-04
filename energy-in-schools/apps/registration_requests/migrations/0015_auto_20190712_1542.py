# Generated by Django 2.1.5 on 2019-07-12 15:42

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('registration_requests', '0014_auto_20190129_1040'),
    ]

    operations = [
        migrations.AlterField(
            model_name='registrationrequest',
            name='activation_reject_reason',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='registrationrequest',
            name='it_manager',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='it_manager_registration_request', to='registration_requests.ContactInformation'),
        ),
        migrations.AlterField(
            model_name='registrationrequest',
            name='questionnaire',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='registration_requests.Questionnaire'),
        ),
        migrations.AlterField(
            model_name='registrationrequest',
            name='registration_number',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='registrationrequest',
            name='registration_reject_reason',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='registrationrequest',
            name='school_manager',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='school_manager_registration_request', to='registration_requests.ContactInformation'),
        ),
        migrations.AlterField(
            model_name='registrationrequest',
            name='utilities_manager',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='utilities_manager_registration_request', to='registration_requests.ContactInformation'),
        ),
    ]