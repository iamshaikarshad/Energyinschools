from django.urls import include, path
from rest_framework import routers

from apps.leaderboard.views.leaderboard import LeaderboardViewSet
from apps.leaderboard.views.energy_dashboard_leagues import DashboardLeaguesViewSet

router = routers.DefaultRouter()
router.register('', LeaderboardViewSet, 'leaderboard')
router.register('leagues', DashboardLeaguesViewSet, 'leagues')

urlpatterns = [
    path('', include(router.urls))
]
