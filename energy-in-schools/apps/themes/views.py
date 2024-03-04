from rest_framework import viewsets

from apps.themes.models import Theme
from apps.themes.serializers import ThemeSerializer

class ThemeViewSet(viewsets.ModelViewSet):
    serializer_class = ThemeSerializer

    def get_queryset(self):
        return Theme.objects.all()
