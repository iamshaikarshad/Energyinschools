from django.db.models import CharField
from encrypted_model_fields.fields import EncryptedCharField, EncryptedTextField
from enumfields import Enum, EnumField

from apps.main.models import BaseModel


class SmartThingsConnectorType(Enum):
    SMART_APP = 'smart_app'
    CLOUD_TO_CLOUD = 'cloud_to_cloud'


class SmartThingsConnector(BaseModel):
    class Meta:
        verbose_name = "Smart Things Connector"
        verbose_name_plural = "Smart Things Connectors"

    Type = SmartThingsConnectorType

    type = EnumField(Type, default=Type.SMART_APP, max_length=20)
    connector_name = CharField(max_length=100, blank=False, null=False)
    connector_id = CharField(max_length=36, blank=False, null=False, unique=True)
    connector_secret = EncryptedCharField(max_length=36, blank=False, null=False)
