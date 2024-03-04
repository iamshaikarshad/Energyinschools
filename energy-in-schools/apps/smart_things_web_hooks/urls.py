from django.urls import path

from apps.smart_things_web_hooks.views import SmartThingsAutomationWebHookView, SmartThingsC2CConnectorWebHookView


urlpatterns = [
    path('automations/<str:connector_name>/', SmartThingsAutomationWebHookView.as_view(), name='automations_web_hook'),
    path('c2c-connectors/<str:connector_name>/', SmartThingsC2CConnectorWebHookView.as_view(),
         name='c2c_connectors_web_hook'),
]
