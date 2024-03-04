import logging

from django.contrib.auth.models import Group, Permission
from django.core.exceptions import ObjectDoesNotExist

from apps.accounts.models import User
from apps.accounts.permissions import RoleName
from apps.accounts.settings import GROUP_PERMISSIONS


def init_groups():
    create_groups()
    set_admin_group()
    set_groups_permissions()


def set_admin_group():
    admin = User.objects.filter(username='admin').first()

    if not admin:
        return

    admin.groups.add(Group.objects.get(name=RoleName.ADMIN))
    admin.save()


def create_groups():
    for new_group_name in GROUP_PERMISSIONS:
        group, created = Group.objects.get_or_create(name=new_group_name)
        group.save()
        if created:
            logging.info(f'Group "{new_group_name}" created.')


def set_groups_permissions(raise_exception=False):
    for group_name, code_names in GROUP_PERMISSIONS.items():
        group = Group.objects.get(name=group_name)
        codename = None
        try:
            group.permissions.set(Permission.objects.filter(codename__in=code_names))
            group.save()
            logging.info(f'Permission for group "{group_name}" set.')
        except ObjectDoesNotExist:
            if raise_exception:
                raise
            else:
                logging.warning(f'Set permissions for group {group_name} failed! '
                                f'Permission "{codename}" does not exists yet!')
