from django.contrib import admin

from apps.learning_days.models import LearningDay

admin.site.register(LearningDay, LearningDay.get_model_admin())
