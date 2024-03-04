import csv
import io
from subprocess import check_output
from typing import Any, Dict, Tuple, Type

from django.conf import settings
from django.contrib.auth.models import Group
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from rest_framework import serializers
from rest_framework.request import Request

from apps.accounts.models import User
from apps.accounts.permissions import RoleName
from apps.blacklisted_emails.tools import AddEmailToBlackListToken
from apps.locations.models import Location
from apps.registration_requests.models import RegistrationRequest


def send_email_notification_by_template(
        subject: str,
        to: str,
        template,
        parameters: Dict[str, Any] = None
):
    html_content = template.render({
        'unsubscribe_link': AddEmailToBlackListToken(email=to).get_unsubscribe_email_link(),
        **(parameters if parameters else {})
    })

    message = EmailMultiAlternatives(subject=subject,
                                     from_email=settings.NOTIFICATION_SENDING_EMAIL,
                                     to=[to])
    message.attach_alternative(html_content, "text/html")
    message.send()


def send_email_notification_by_template_to_admins(
        subject: str,
        template,
        parameters: Dict[str, Any] = None,
):
    admins = User.objects.filter(groups__name=RoleName.ADMIN)

    if not admins:
        raise ValueError('There no any admin!')

    for admin in admins:
        send_email_notification_by_template(
            subject=subject,
            to=admin.email,
            template=template,
            parameters=dict(
                all_requests_link=settings.LINKS.ALL_REQUESTS,
                **(parameters or {}),
            ),
        )


def send_credentials_via_email(
        school_name: str,
        csv_text: str,
        template: str,
        receivers: Tuple[str],
        parameters: Dict[str, Any] = None
):
    for email in receivers:
        html_content = get_template(template).render(dict(
            unsubscribe_link=AddEmailToBlackListToken(
                email=email
            ).get_unsubscribe_email_link(),
            **(parameters or {})
        ))
        message = EmailMultiAlternatives(
            subject=f'School account for {school_name} has been created',
            from_email=settings.NOTIFICATION_SENDING_EMAIL,
            to=[email]
        )
        message.attach_alternative(html_content, "text/html")
        message.attach('credentials.csv', csv_text, 'text/csv')
        message.send()


def create_or_update_school_members(location: Location, registration_request: RegistrationRequest) -> str:
    """

    :return: credentials in csv format
    
    """
    csv_text = io.StringIO()
    csv_writer = csv.writer(csv_text)
    csv_writer.writerow(['Role', 'Login', 'Password'])

    for group_name in RoleName.get_all_schools_roles():
        user, _ = User.objects.get_or_create(
            email=registration_request.email if group_name == RoleName.SLE_ADMIN else '',
            username=User.make_school_member_username(registration_request.school_nickname, group_name)
        )

        if group_name == RoleName.ES_USER:
            password = None

        elif group_name == RoleName.PUPIL:
            password = gen_simple_password()

        else:
            password = User.objects.make_random_password()

        user.set_password(password)

        user.location = location
        user.save()
        user.groups.add(Group.objects.get(name=group_name))
        user.save()

        csv_writer.writerow([group_name, user.username, password or '<NotAcceptable>'])

    return csv_text.getvalue()


def update_registration_request(
        request: Request,
        serializer_class: Type[serializers.Serializer],
        registration_request:
        RegistrationRequest, **save_params
):
    serializer = serializer_class(registration_request, data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(**save_params)


def gen_simple_password() -> str:
    return check_output('make_pass -m 10 -M 22 -w 4 -t 1000 -n'.split()).decode().strip().lower()
