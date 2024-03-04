from rest_framework.viewsets import ModelViewSet

from apps.energy_providers.models import EnergyProviderAccount
from apps.energy_providers.serializers import EnergyProviderSerializer
from apps.locations.decorators import own_location_only
from apps.main.view_mixins import SoftDeleteCreateModelViewSetMixin


class EnergyProviderViewSet(SoftDeleteCreateModelViewSetMixin, ModelViewSet):
    serializer_class = EnergyProviderSerializer

    @own_location_only
    def get_queryset(self):
        return EnergyProviderAccount.objects.all()
