import json
from datetime import datetime, timedelta, timezone

from django.db import models
from django.db.models import CASCADE
from django.db.transaction import atomic
from encrypted_model_fields.fields import EncryptedCharField

from apps.locations.models import Location
from apps.main.models import BaseModel
from apps.smart_things_apps.settings import AUTH_TOKEN_LIVE_TIME, REFRESH_TOKEN_CYCLE, REFRESH_TOKEN_LIVE_TIME
from apps.smart_things_apps.types import SmartThingsError, SmartAppConnectivityStatus, AuthCredentialsError
from apps.smart_things_web_hooks.models import SmartThingsConnector


class SmartThingsApp(BaseModel):
    class Meta:
        verbose_name = "SmartThings App"
        verbose_name_plural = "SmartThings Apps"

    location = models.ForeignKey(Location, on_delete=CASCADE, related_name='smart_things_apps')
    connector = models.ForeignKey(SmartThingsConnector, on_delete=CASCADE, related_name='apps', null=False)

    _auth_token = EncryptedCharField(max_length=50, blank=False, null=False)
    refresh_token = EncryptedCharField(max_length=50, blank=False, null=False)

    app_id = models.CharField(max_length=50, blank=False, null=False)
    app_location_id = models.CharField(max_length=50, blank=False, null=False)

    auth_token_updated_at = models.DateTimeField(auto_now_add=True)
    refresh_token_updated_at = models.DateTimeField(auto_now_add=True)

    token_refresh_in_progress = models.BooleanField(default=False, null=False)

    @property
    def auth_token(self):
        if self.is_token_expired():
            self.refresh_auth_token(self.id)
            self.refresh_from_db()

        return self._auth_token

    @auth_token.setter
    def auth_token(self, value):
        self._auth_token = value

    @classmethod
    @atomic
    def refresh_auth_token(cls, smart_things_app_id: int):
        from apps.smart_things_apps.utilities import SmartThingsAuthApiConnector

        smart_things_app = cls.objects.select_for_update().get(id=smart_things_app_id)

        if not smart_things_app.is_token_expired() or smart_things_app.token_refresh_in_progress:
            return

        smart_things_app.token_refresh_in_progress = True
        smart_things_app.save()
        connector = SmartThingsAuthApiConnector(smart_things_app)
        token_pair = connector.get_token_pair(smart_things_app.connector)

        smart_things_app.auth_token = token_pair.access_token
        smart_things_app.refresh_token = token_pair.refresh_token
        smart_things_app.auth_token_updated_at = datetime.now(timezone.utc)
        smart_things_app.refresh_token_updated_at = datetime.now(timezone.utc)
        smart_things_app.token_refresh_in_progress = False
        smart_things_app.save()

    @classmethod
    def refresh_old_refresh_tokens(cls):
        refresh_date = datetime.now(timezone.utc) - REFRESH_TOKEN_CYCLE
        errors = []
        for smart_things_app in cls.objects.filter(refresh_token_updated_at__lte=refresh_date):
            try:
                cls.refresh_auth_token(smart_things_app.id)
            except Exception as exception:
                errors.append(dict(id=smart_things_app.id, reasone=str(exception)))

        if errors:
            raise SmartThingsError(f'Some token refreshing was failed with next reasons: {json.dumps(errors)}')

    def is_token_expired(self):
        return \
            datetime.now(timezone.utc) - self.auth_token_updated_at >= (AUTH_TOKEN_LIVE_TIME - timedelta(minutes=1))

    def get_refresh_token_status(self, hard_check=False):
        if self.refresh_token_updated_at < datetime.now(timezone.utc) - REFRESH_TOKEN_LIVE_TIME:
            status = SmartAppConnectivityStatus.REFRESH_TOKEN_EXPIRED

        elif self.refresh_token_updated_at < datetime.now(timezone.utc) - REFRESH_TOKEN_CYCLE:
            status = SmartAppConnectivityStatus.REFRESH_TOKEN_SHOULD_BE_REFRESHED

        else:
            status = SmartAppConnectivityStatus.CONNECTED

        if hard_check and status == SmartAppConnectivityStatus.CONNECTED:
            from apps.smart_things_devices.utilities.connectors import SmartThingsApiConnector

            try:
                SmartThingsApiConnector(self).get_location()

            except AuthCredentialsError:
                status = SmartAppConnectivityStatus.REFRESH_TOKEN_BROKEN

            except SmartThingsError:  # Other SmartThings errors except of AuthCredentialsError
                status = SmartAppConnectivityStatus.UNKNOWN

        return status

    def __str__(self):
        time_left = REFRESH_TOKEN_LIVE_TIME - (datetime.now(timezone.utc) - self.refresh_token_updated_at)
        return f'pk: {self.pk}, Location__uid: {self.location.uid} (time left: {time_left.days})'
