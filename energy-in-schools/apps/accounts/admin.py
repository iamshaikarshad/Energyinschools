from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.accounts.models import User


class MyUserAdmin(UserAdmin):
    """Custom admin for specific fields at admin panel"""
    model = User

    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('location',)}),
    )


admin.site.register(User, MyUserAdmin)
