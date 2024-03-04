from django.contrib import admin

from apps.blacklisted_emails.models import BlacklistedEmail


class BlacklistedEmailAdmin(admin.ModelAdmin):
    list_display = ['email']
    list_filter = ['email']


admin.site.register(BlacklistedEmail, BlacklistedEmailAdmin)
