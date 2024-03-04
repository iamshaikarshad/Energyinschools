import coreapi
import coreschema
import django_filters
from django.db.models import QuerySet, Q
from rest_framework import viewsets
from rest_framework.filters import BaseFilterBackend
from rest_framework.request import Request

from apps.facts.models import Fact
from apps.facts.serializers import FactSerializer
from apps.locations.models import Location


class SchoolIdFilterBackend(BaseFilterBackend):
    def filter_queryset(self, request: Request, queryset: QuerySet, view):
        school_id = request.query_params.get('school_id', '')
        if school_id:
            try:
                school = Location.objects.get(uid=school_id)
                theme = school.current_theme
            except Location.DoesNotExist:
                theme = None
            
            queryset = queryset.filter(
                Q(school__uid=school_id) | Q(school=None)
            )

            if theme:
                queryset = queryset.filter(theme=theme)

        return queryset

    def get_schema_fields(self, view):
        return [coreapi.Field(
            name='school_id',
            location='query',
            required=False,
            type='string',
            description='Return only facts that used in schools',
            schema=coreschema.String(),
            example='true'
        )]


class FactViewSet(viewsets.ModelViewSet):
    serializer_class = FactSerializer
    queryset = Fact.objects.all()
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, SchoolIdFilterBackend)
