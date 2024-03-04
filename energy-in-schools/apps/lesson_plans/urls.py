from django.urls import include, path
from rest_framework import routers

from apps.lesson_plans.views import LessonPlanViewSet, LessonPlanNewViewSet, LessonGroupViewSet, LessonGroupNewViewSet


router_lessons = routers.DefaultRouter()
router_lessons.register('', LessonPlanViewSet, 'lesson-plan-view-set')

router_lessons_new = routers.DefaultRouter()
router_lessons_new.register('', LessonPlanNewViewSet, 'lesson-plan-new-view-set')

router_lesson_groups = routers.DefaultRouter()
router_lesson_groups.register('', LessonGroupViewSet, 'lesson-group-view-set')

router_lesson_groups_new = routers.DefaultRouter()
router_lesson_groups_new.register('', LessonGroupNewViewSet, 'lesson-group-new-view-set')

urlpatterns = [
    path('lesson-plans/', include(router_lessons.urls)),
    path('lesson-plans-new/', include(router_lessons_new.urls)),
    path('lesson-groups/', include(router_lesson_groups.urls)),
    path('lesson-groups-new/', include(router_lesson_groups_new.urls)),
]
