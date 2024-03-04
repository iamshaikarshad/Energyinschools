from django_filters.rest_framework import FilterSet

from apps.locations.filters import OwnLocationOnlyFilter, SubLocationIdFilter, SubLocationUidFilter


class ByLocationFilterSet(FilterSet):
    location_uid = SubLocationUidFilter()
    sub_location_id = SubLocationIdFilter()

    class Meta:
        model = None
        fields = (
            'location_uid',
            'sub_location_id',
        )


class OwnLocationOnlyFilterSet(FilterSet):
    own_location_only = OwnLocationOnlyFilter()

    class Meta:
        model = None
        fields = (
            'own_location_only',
        )
