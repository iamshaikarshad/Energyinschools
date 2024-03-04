"""samsung_school URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include(apps.) function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include(apps.'blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import RedirectView, TemplateView
from django.views.static import serve
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework.permissions import AllowAny

import apps.accounts.urls
import apps.auth_token.urls
import apps.blacklisted_emails.urls
import apps.carbon_intensity.urls
import apps.cashback.urls
import apps.energy_dashboard.urls
import apps.energy_meters.urls
import apps.energy_meters_billing_info.urls
import apps.energy_providers.urls
import apps.energy_tariffs.urls
import apps.facts.urls
import apps.forum.urls
import apps.hubs.urls
import apps.leaderboard.urls
import apps.learning_days.urls
import apps.lesson_plans.urls
import apps.locations.urls
import apps.manuals.urls
import apps.microbit_devices.urls
import apps.microbit_energy.urls
import apps.microbit_historical_data.urls
import apps.microbit_variables.urls
import apps.microbit_weather.urls
import apps.news.urls
import apps.notifications.urls
import apps.registration_requests.urls
import apps.resources.urls
import apps.smart_things_apps.urls
import apps.smart_things_devices.urls
import apps.smart_things_sensors.urls
import apps.smart_things_web_hooks.urls
import apps.storage.urls
import apps.themes.urls
import apps.weather.urls
import apps.mug_service.urls
import apps.schools_metrics.urls
from utilities.private_file_views import SignedPrivateStorageView

schema_view = get_schema_view(
    openapi.Info(
        title="Samsung School API",
        default_version='v1',
    ),
    validators=['flex', 'ssv'],
    public=True,
    permission_classes=(AllowAny,),
)
urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/v1/token/', include(apps.auth_token.urls)),

    path('api/v1/users/', include(apps.accounts.urls), name='users'),
    path('api/v1/locations/', include(apps.locations.urls), name='locations'),
    path('api/v1/registration-requests/', include(apps.registration_requests.urls), name='registration_requests'),
    path('api/v1/blacklisted-emails/', include(apps.blacklisted_emails.urls), name='blacklisted_emails'),

    path('api/v1/resources/', include(apps.resources.urls), name='resource'),

    path('api/v1/energy-dashboard/', include(apps.energy_dashboard.urls), name='energy_dashboard'),

    path('api/v1/energy-providers/', include(apps.energy_providers.urls), name='energy_providers'),
    path('api/v1/energy-tariffs/', include(apps.energy_tariffs.urls), name='energy_providers'),
    path('api/v1/energy-meters/', include(apps.energy_meters.urls), name='energy_meters'),
    path('api/v1/energy-meters-billing-info/', include(apps.energy_meters_billing_info.urls),
         name='energy_meters_billing_info'),
    path('api/v1/energy-cashback/', include(apps.cashback.urls), name='energy_cashback'),

    path('api/v1/hubs/', include(apps.hubs.urls), name='hubs'),
    path('api/v1/storage/', include(apps.storage.urls), name='storage'),

    # todo: make plural: weather, energy
    path('api/v1/micro-bit/devices/', include(apps.microbit_devices.urls), name='microbit_devices'),
    path('api/v1/micro-bit/variables/', include(apps.microbit_variables.urls), name='microbit_variables'),
    path('api/v1/micro-bit/weather/', include(apps.microbit_weather.urls), name='microbit_weather'),
    path('api/v1/micro-bit/energy/', include(apps.microbit_energy.urls), name='microbit_energy_meters'),
    path('api/v1/micro-bit/historical-data/', include(apps.microbit_historical_data.urls),
         name='microbit_historical_data'),

    path('api/v1/smart-things/devices/', include(apps.smart_things_devices.urls), name='smart_things_devices'),
    path('api/v1/smart-things/applications/', include(apps.smart_things_apps.urls), name='smart_things_applications'),
    path('api/v1/smart-things/web-hooks/', include(apps.smart_things_web_hooks.urls), name='smart_things_web_hooks'),
    path('api/v1/smart-things/', include(apps.smart_things_sensors.urls), name='smart_things_sensors'),

    path('api/v1/learning-days/', include(apps.learning_days.urls), name='learning_days'),
    path('api/v1/notifications/', include(apps.notifications.urls), name='notifications'),
    path('api/v1/forum/', include(apps.forum.urls), name='forum'),
    path('api/v1/lessons/', include(apps.lesson_plans.urls), name='lessons'),
    path('api/v1/manuals/', include(apps.manuals.urls), name='manuals'),

    # dashboard
    path('api/v1/facts/', include(apps.facts.urls), name='facts'),
    path('api/v1/themes/', include(apps.themes.urls), name='themes'),
    path('api/v1/weathers/', include(apps.weather.urls), name='weather'),
    path('api/v1/news/', include(apps.news.urls), name='news'),
    path('api/v1/carbon-emission/', include(apps.carbon_intensity.urls), name='carbon_emission'),
    path('api/v1/leaderboard/', include(apps.leaderboard.urls), name='leaderboard'),

    # mug service
    path('api/v1/mug-api/', include(apps.mug_service.urls), name='mug_service'),

    path('api/v1/schools-metrics/', include(apps.schools_metrics.urls), name='schools-metrics'),

    path('api/v1/docs/', RedirectView.as_view(url='swagger/', permanent=False), name='documentation'),
    path('api/v1/docs/swagger/', schema_view.with_ui('swagger', cache_timeout=None), name='schema_swagger_ui'),
    path('api/v1/docs/redoc/', schema_view.with_ui('redoc', cache_timeout=None), name='schema_redoc'),

    path('tinymce/', include('tinymce.urls')),

    path('martor/', include('martor.urls')),

    re_path(r'^api/v1/private-media/(?P<path>.*)$', SignedPrivateStorageView.as_view(), name='serve_private_file'),

    # just for local tests:
    path('how-to-apply/', RedirectView.as_view(url='/static/documents/expressions_of_interest.svg', permanent=False),
         name='how-to-apply'),

    path('webhub', TemplateView.as_view(template_name='webhub.html')),
    path('webhub/', TemplateView.as_view(template_name='webhub.html')),
    re_path('^(?!api/)(?!static/)(?!media/).*$', TemplateView.as_view(template_name='index.html')),

    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
]
