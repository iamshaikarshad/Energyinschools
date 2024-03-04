from rest_framework.permissions import AllowAny
from rest_framework.viewsets import ReadOnlyModelViewSet

from apps.manuals.models import Category, Manual
from apps.manuals.serializers import CategorySerializer, ManualSerializer


class CategoryViewSet(ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    serializer_class = CategorySerializer
    queryset = Category.objects.order_by('priority').all()


class ManualViewSet(ReadOnlyModelViewSet):
    lookup_field = 'slug'
    serializer_class = ManualSerializer
    queryset = Manual.objects.all()
    permission_classes = (AllowAny,)
