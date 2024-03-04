from django.contrib.auth.models import AbstractUser, Group, UserManager
from django.db.models import ForeignKey, IntegerField, PROTECT
from stringcase import sentencecase

from apps.accounts.permissions import RoleName
from apps.locations.models import Location
from apps.locations.querysets import InLocationQuerySet
from apps.main.models import BaseModel


class UserManagerFromInLocationQuerySet(UserManager.from_queryset(InLocationQuerySet)):
    pass


class User(AbstractUser, BaseModel):
    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        permissions = (
            ('manage_sme_admins', 'Can manage SME admins'),
            ('manage_teachers', 'Can manage teachers'),
            ('manage_pupils', 'Can manage pupils'),
            ('manage_energy_screen', 'Can manage energy screen'),
            ('view_energy_screen', 'Can view energy screen')
        )

    objects = UserManagerFromInLocationQuerySet()

    location = ForeignKey(Location, on_delete=PROTECT, null=True, blank=True)
    password_version = IntegerField(default=1)

    @property
    def role(self):
        if self.is_staff:
            return RoleName.ADMIN

        group = self.groups.filter(name__in=RoleName.get_all()).first()
        if group:
            return group.name

    @role.setter
    def role(self, name: str):
        self.groups.set(Group.objects.get(name=name))

    @staticmethod
    def make_school_member_username(school_nickname: str, role: str):
        if {' ', '_', '-'}.intersection(school_nickname):
            school_nickname = school_nickname.lower()

        return f'{sentencecase(school_nickname)} {sentencecase(role)}'.lower()
