from django.contrib.auth.models import AnonymousUser
from rest_framework.permissions import BasePermission

from apps.accounts.permissions import RoleName


class SEMAdminPermission(BasePermission):

    def has_permission(self, request, view):
        return request.user.role == RoleName.SEM_ADMIN


class MUGUserPermission(BasePermission):

    def has_permission(self, request, view):
        return request.user.role == RoleName.MUG_USER


class ESUserPermission(BasePermission):

    def has_permission(self, request, view):
        if not isinstance(request.user, AnonymousUser):
            return request.user.role == RoleName.ES_USER

        return False
