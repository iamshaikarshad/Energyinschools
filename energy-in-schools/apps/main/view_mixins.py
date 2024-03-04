from http import HTTPStatus
from typing import Iterable

from drf_yasg.utils import swagger_auto_schema
from rest_framework import mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from safedelete.config import DELETED_ONLY_VISIBLE, HARD_DELETE

from apps.main.models import SafeDeleteBaseModel
from apps.smart_things_apps.serializers import EmptySerializer


class SoftDeleteCreateModelViewSetMixin(mixins.CreateModelMixin,
                                        mixins.DestroyModelMixin,
                                        GenericViewSet):
    def perform_create(self, serializer):
        serializer.instance = self.get_serializer_instance(serializer)
        super().perform_create(serializer)

    def get_unique_together_fields(self) -> Iterable[str]:
        # noinspection PyProtectedMember
        return [
            key
            for unique_together_group in self.serializer_class.Meta.model._meta.unique_together
            for key in unique_together_group
        ]

    def get_serializer_instance(self, serializer):
        return self \
            .get_queryset() \
            .all(force_visibility=DELETED_ONLY_VISIBLE) \
            .filter(**{key: serializer.validated_data[key] for key in self.get_unique_together_fields()}) \
            .first()

    @swagger_auto_schema(request_body=EmptySerializer, responses={HTTPStatus.OK.value: HTTPStatus.OK.phrase})
    @action(detail=True, methods=['post'], url_path='delete-permanently')
    def delete_permanently(self, *_, **__):
        instance: SafeDeleteBaseModel = self.get_object()
        instance.delete(force_policy=HARD_DELETE)

        return Response(status=status.HTTP_200_OK)
