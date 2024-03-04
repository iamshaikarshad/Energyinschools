from apps.accounts.models import User
from apps.accounts.permissions import RoleName


class DashboardAuthBackend:
    """API Auth for Energy Dashboard Screen"""
    @staticmethod
    def authenticate(location_uid: str):
        try:
            return User.objects.get(location__uid=location_uid, groups__name=RoleName.ES_USER)
        except User.DoesNotExist:
            return None

    @staticmethod
    def get_user(user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
