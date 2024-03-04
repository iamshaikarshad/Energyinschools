from rest_framework.mixins import ListModelMixin, RetrieveModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
from drf_yasg.utils import swagger_auto_schema

from apps.lesson_plans.models import LessonPlan, LessonGroup, LessonPlanNew
from apps.lesson_plans.serializers import LessonPlanSerializer, LessonPlanNewSerializer, LessonGroupSerializer, LessonGroupQueryParamsSerializer, LessonGroupNewSerializer


@method_decorator(
    name='list',
    decorator=swagger_auto_schema(
        query_serializer=LessonGroupQueryParamsSerializer
    )
)
class LessonPlanViewSet(ListModelMixin, GenericViewSet):
    serializer_class = LessonPlanSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        group_id = self.request.query_params.get('lesson_group')
        return LessonPlan.objects.filter(lesson_group=group_id) if group_id else LessonPlan.objects.all()


class LessonPlanNewViewSet(ListModelMixin, GenericViewSet):
    serializer_class = LessonPlanNewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        group_id = self.request.query_params.get('lesson_group')
        return LessonPlanNew.objects.filter(lesson_group=group_id) if group_id else LessonPlanNew.objects.all()


class LessonGroupViewSet(ListModelMixin, RetrieveModelMixin, GenericViewSet):

    serializer_class = LessonGroupSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return LessonGroup.objects.filter(type__isnull=True)


class LessonGroupNewViewSet(ListModelMixin, RetrieveModelMixin, GenericViewSet):

    serializer_class = LessonGroupNewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return LessonGroup.objects.filter(type__isnull=False).prefetch_related('lesson_plans')

