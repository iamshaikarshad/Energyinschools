from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView

from apps.auth_token.views import AuthTokenObtainPairView, DashboardTokenObtainPairView,\
    MUGAuthTokenObtainPairView, AuthTokenRefreshView


urlpatterns = [
    path('', AuthTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('dashboard/', DashboardTokenObtainPairView.as_view(), name='dashboard_token_obtain_pair'),
    path('mug/', MUGAuthTokenObtainPairView.as_view(), name='mug_token_obtain_pair'),
    path('refresh/', AuthTokenRefreshView.as_view(), name='token_refresh'),
    path('verify/', TokenVerifyView.as_view(), name='token_verify'),
]
