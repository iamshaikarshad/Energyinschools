import funcy
import csv

from typing import Any, Dict, Type
from django.http import HttpResponse
from rest_framework import serializers
from rest_framework.views import APIView


class DeserializeQueryParamsMixin(APIView):
    query_serializer_class: Type[serializers.Serializer] = None

    def get_query_params_dict(self, query_serializer_class: Type[serializers.Serializer] = None) -> Dict[str, Any]:
        query_serializer_class = query_serializer_class or self.query_serializer_class
        assert query_serializer_class, 'query_serializer or self.query_serializer should be specified!'

        query_serializer = query_serializer_class(data=self.request.query_params)
        query_serializer.context['request'] = self.request
        query_serializer.is_valid(raise_exception=True)

        return query_serializer.validated_data

    @funcy.cached_property
    def query_params_dict(self) -> Dict[str, Any]:
        return self.get_query_params_dict()


class ExportToFileMixin:
    fields_to_exclude = []
    fields_to_include = []

    def export_as_csv(self, request, queryset):
        meta = self.model._meta
        field_names = [
            field.name for field in meta.fields
            if field.name not in self.fields_to_exclude
            and (field.name in self.fields_to_include or len(self.fields_to_include) == 0)
        ]

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename={}.csv'.format(meta.verbose_name_plural.lower())
        writer = csv.writer(response)

        writer.writerow(field_names)
        for obj in queryset:
            writer.writerow([getattr(obj, field) for field in field_names])

        return response

    export_as_csv.short_description = 'Export as CSV'