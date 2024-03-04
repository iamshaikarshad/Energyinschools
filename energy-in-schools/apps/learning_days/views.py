from rest_framework.viewsets import ModelViewSet

from apps.learning_days.models import LearningDay
from apps.learning_days.serializers import LearningDaySerializer
from apps.locations.decorators import own_location_only


class LearningDayViewSet(ModelViewSet):
    serializer_class = LearningDaySerializer

    @own_location_only
    def get_queryset(self):
        return LearningDay.objects.all()

    def perform_create(self, serializer):
        serializer.save(location=self.request.user.location)
