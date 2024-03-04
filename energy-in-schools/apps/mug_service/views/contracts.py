from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from apps.accounts.view_permissions import MUGUserPermission
from apps.mug_service.models import Switch
from apps.mug_service.serializers import UpdateSwitchSerializer
from apps.mug_service.constants import SwitchStatus


class ContractsViewSet(ViewSet):
    permission_classes = (IsAuthenticated, MUGUserPermission)

    def _get_switch_object(self):
        return get_object_or_404(
            Switch.objects.all(),
            contract_id=self.kwargs['pk'],
        )

    @swagger_auto_schema(method='post',
                         request_body=UpdateSwitchSerializer)
    @action(methods=['post'], detail=True)
    def update_switch(self, request, *_, **__):
        switch = self._get_switch_object()
        serializer = UpdateSwitchSerializer(data=request.data, context={'switch': switch})
        serializer.is_valid(raise_exception=True)
        Switch.objects.filter(pk=switch.id).update(**serializer.validated_data)
        switch.refresh_from_db()

        if serializer.validated_data.get('status') == SwitchStatus.LIVE_SWITCH_COMPLETE:
            switch.energy_meter_billing_info.update_on_switch_complete(switch)

            for consumption_rate in switch.energy_meter_billing_info.consumption_by_rates.all():
                consumption_rate.update_on_switch_complete(switch)
        return Response()
