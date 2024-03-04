from django.contrib import admin

from apps.resources.models import Resource
from utilities.serializer_helpers import get_serializer_fields


class DisableRelationListingMixin(admin.ModelAdmin):
    def get_deleted_objects(self, objs, request):
        return [
            'The model can have too many related records - objects listing is disabled'
        ], {
            'The model can have too many related records - summary is disabled': ''
        }, set(), []


class ResourceChildAdmin(DisableRelationListingMixin):
    def get_form(self, request, obj=None, change=False, **kwargs):
        if not obj:
            self.exclude = get_serializer_fields(
                Resource.child_type,
                Resource.supported_data_collection_methods,
                Resource.preferred_data_collection_method,
                Resource.unit,
                Resource.detailed_time_resolution,
                Resource.long_term_time_resolution,
                Resource.detailed_data_live_time,
                Resource.last_detailed_data_add_time,
                Resource.last_long_term_data_add_time,
                add_id=False
            )
        return super().get_form(request, obj, change, **kwargs)


class ResourceModelAdmin(Resource.get_model_admin(), DisableRelationListingMixin):
    pass


admin.site.register(Resource, ResourceModelAdmin)
