from django.contrib import admin

from apps.lesson_plans.models import LessonPlan, LessonPlanNew, LessonObjective, SuccessCriteria, LessonGroup

admin.site.register(LessonPlan, LessonPlan.get_model_admin())
admin.site.register(LessonPlanNew, LessonPlanNew.get_model_admin())
admin.site.register(LessonObjective, LessonObjective.get_model_admin())
admin.site.register(SuccessCriteria, SuccessCriteria.get_model_admin())
admin.site.register(LessonGroup, LessonGroup.get_model_admin())
