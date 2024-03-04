from django.urls import path

from apps.microbit_variables.views import MicrobitVariablesView

urlpatterns = [
    path('', MicrobitVariablesView.as_view(actions={'get': 'list'}), name='variables'),
    path('<key>/', MicrobitVariablesView.as_view(actions={'get': 'retrieve',
                                                                    'post': 'create_or_update',
                                                                    'put': 'create_or_update',
                                                                    'patch': 'partial_update',
                                                                    'delete': 'destroy'})),
    path('<key>/school/<school_id>/', MicrobitVariablesView.as_view(actions={'get': 'retrieve'})),
]
