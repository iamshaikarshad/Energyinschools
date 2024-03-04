from django.urls import path, include
from rest_framework import routers

from apps.mug_service.views.contracts import ContractsViewSet
from apps.mug_service.views.tariff_comparison import comparison
from apps.mug_service.views.mug_meter import MUGMeterViewSet, get_meter_info, create_mug_meter, get_meter_savings, get_carbon_intensity
from apps.mug_service.views.postcode import MugPostcodeViewSet
from apps.mug_service.views.suppliers import suppliers
from apps.mug_service.views.switches import SwitchesViewSet, LocationSwitchesViewSet

router = routers.DefaultRouter()
router.register('meters', MUGMeterViewSet)
router.register('energy-meters-billing-info/(?P<id>[0-9]+)/switches', SwitchesViewSet, 'switches')
router.register('switches', LocationSwitchesViewSet, 'all_switches')
router.register('contracts', ContractsViewSet, 'contracts')
router.register('', MugPostcodeViewSet, 'mug_address')

urlpatterns = [
    path('comparison/', comparison, name='tariff_comparison'),
    path('suppliers/', suppliers, name='suppliers'),
    path('meter-info/', get_meter_info, name='meter-info'),
    path('meter/', create_mug_meter, name='create-mug-meter'),
    path('meter/savings/<int:location_id>/<int:embi_id>/', get_meter_savings, name='get-savings'),
    path('meter/carbonintensity/<int:location_id>/<int:embi_id>/', get_carbon_intensity, name='get-carbon-intensity'),
    path('', include(router.urls)),
]
