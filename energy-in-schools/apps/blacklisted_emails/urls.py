from django.urls import path, include
from rest_framework import routers

from apps.blacklisted_emails.views import BlacklistedEmailsViewSet

router = routers.DefaultRouter()
router.register('', BlacklistedEmailsViewSet, 'blacklisted-emails')

urlpatterns = [
    path('', include(router.urls))
]
