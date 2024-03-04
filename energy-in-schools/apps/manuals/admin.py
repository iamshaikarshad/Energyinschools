from django.contrib import admin
from django.db import models
from martor.widgets import AdminMartorWidget

from apps.manuals.models import Category, Manual, ManualMediaFile

ManualModelAdmin = Manual.get_model_admin()


@admin.register(Manual)
class ManualAdmin(ManualModelAdmin):
    fields = ('title', 'category', 'avatar_image', 'avatar_video', 'slug', 'priority', 'body',)
    prepopulated_fields = {'slug': ('title',), }
    formfield_overrides = {
        models.TextField: {'widget': AdminMartorWidget},
    }


admin.site.register(Category, Category.get_model_admin())
admin.site.register(ManualMediaFile, ManualMediaFile.get_model_admin())
