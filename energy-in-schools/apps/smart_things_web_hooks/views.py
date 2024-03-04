import logging
from typing import Type

from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.smart_things_web_hooks.handlers import SmartAppWebHookHandler, AbstractSmartThingsWebHookHandler, \
    C2CDeviceWebHookHandler

logger = logging.getLogger(__name__)


class AbstractWebHookHandler(APIView):
    permission_classes = (AllowAny,)
    web_hook_handler_class: Type[AbstractSmartThingsWebHookHandler] = None

    @csrf_exempt
    def post(self, request: Request, connector_name: str):
        handler = self.web_hook_handler_class(request.data, connector_name)
        handler.verify_sender(
            headers={'authorization': request.META.get('HTTP_AUTHORIZATION', ''),
                     'digest': request.META.get('HTTP_DIGEST', ''),
                     'date': request.META.get('HTTP_DATE', '')},
            path=request.path
        )
        response_data = handler.process_request()

        if handler.smart_things_app and handler.lifecycle in ['INSTALL', 'UPDATE', 'UNINSTALL, CONFIRMATION']:
            logger.info(
                f'[SmartAppId]-{handler.smart_things_app.app_id}; [LocationUID]-{handler.smart_things_app.location.uid} handles {handler.lifecycle} lifecycle'
            )

        return Response(response_data)


class SmartThingsAutomationWebHookView(AbstractWebHookHandler):
    web_hook_handler_class = SmartAppWebHookHandler


class SmartThingsC2CConnectorWebHookView(AbstractWebHookHandler):
    web_hook_handler_class = C2CDeviceWebHookHandler
