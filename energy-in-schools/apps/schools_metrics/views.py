from rest_framework.mixins import ListModelMixin, RetrieveModelMixin
from rest_framework.permissions import IsAdminUser
from rest_framework.viewsets import GenericViewSet

from apps.locations.models import Location
from apps.schools_metrics.serializers import SchoolsMetricsSerializer


class SchoolsMetricsViewSet(ListModelMixin, RetrieveModelMixin, GenericViewSet):
    serializer_class = SchoolsMetricsSerializer
    queryset = Location.objects.filter(parent_location__isnull=True)
    permission_classes = [IsAdminUser]
