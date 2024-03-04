from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from apps.schools_metrics.serializers import SmartThingsAppTokenSerializer
from apps.smart_things_apps.models import SmartThingsApp
from apps.smart_things_apps.serializers import EmptySerializer


class RefreshSmartThingsTokensViewSet(GenericViewSet):
    serializer_class = EmptySerializer
    queryset = SmartThingsApp.objects.all()

    @action(methods=['post'], detail=False, url_path='refresh-tokens')
    def refresh_tokens(self, *_, **__):
        SmartThingsApp.refresh_old_refresh_tokens()
        return Response()

    @action(methods=['get'], detail=True)
    def refresh_token_health(self, *_, **__):
        app: SmartThingsApp = self.get_object()
        serializer = SmartThingsAppTokenSerializer(data=dict(
            app_id=app.id,
            status=app.get_refresh_token_status(hard_check=True),
            refresh_token_updated_at=app.refresh_token_updated_at,
        ))
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)
