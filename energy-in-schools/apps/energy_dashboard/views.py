from datetime import datetime, timezone
from http import HTTPStatus

from apps.locations.models import Location
from drf_yasg.utils import swagger_auto_schema
from rest_framework import mixins, viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from apps.accounts.view_permissions import ESUserPermission
from apps.energy_dashboard.models import DashboardScreen, DashboardPing, Tip
from apps.energy_dashboard.serializers import (
    DashboardScreenSerializer, RequestDashboardTypeSerializer
)


class EnergyDashboardScreenViewSet(mixins.ListModelMixin,
                                   GenericViewSet):
    serializer_class = DashboardScreenSerializer
    queryset = DashboardScreen.objects.all()


@swagger_auto_schema(method='post',
                     request_body=RequestDashboardTypeSerializer,
                     responses={
                         HTTPStatus.OK.value: RequestDashboardTypeSerializer,
                         HTTPStatus.FORBIDDEN.value: HTTPStatus.FORBIDDEN.phrase,
                     })
@api_view(['POST'])
@permission_classes((ESUserPermission,))
def ping(request: Request, *_, **__):

    serializer = RequestDashboardTypeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    DashboardPing.objects.update_or_create(
        type=serializer.validated_data['type'],
        location=request.user.location,
        defaults={
            'last_ping': datetime.now(timezone.utc)
        },
    )

    return Response()


class TipsViewSet(viewsets.ViewSet):
    queryset = Tip.objects.all()
    permission_classes = [AllowAny]

    @staticmethod
    def validate_post_request(data):
        if 'tips' not in data:
            return "Missing required parameter tips"
        if 'school_id' not in data and 'school_name' not in data:
            return "Missing school_id/school_name parameter"
        return None

    def list(self, request):
        records = self.queryset.all()

        if not len(records):
            return Response({
                'status': 'Not found',
                'message': "There are no tips recorded"
            }, status=status.HTTP_404_NOT_FOUND)

        school_name = records[0].school_name
        city = records[0].city

        response = {
            'school_name': school_name,
            'city': city,
            'tips': [record.text for record in records]
        }

        return Response(response, status=status.HTTP_200_OK)

    def create(self, request):
        data = request.data

        if not request.user.is_superuser:
            return Response({
                'status': 'Forbidden request',
                'message': 'You are not allowed to perform this operation'
            }, status=status.HTTP_403_FORBIDDEN)

        error = TipsViewSet.validate_post_request(data)
        if not error:
            response = data

            self.queryset.delete()
            if 'school_id' not in data:
                records = [Tip(
                    school_name=data['school_name'],
                    city=data['city'] if 'city' in data else None,
                    text=tip
                ) for tip in data['tips']]
            else:
                try:
                    if 'uid' in data and data['uid']:
                        school = Location.objects.get(uid=data['school_id'])
                    else:
                        school = Location.objects.get(id=data['school_id'])
                    records = [Tip(
                        school_name=school.name,
                        city=school.address.city,
                        text=tip
                    ) for tip in data['tips']]
                    response = {
                        'school_name': school.name,
                        'city': school.address.city,
                        'tips': data['tips']
                    }
                except Location.DoesNotExist:
                    return Response({
                        'status': 'Bad request',
                        'message': "School does not exist"
                    }, status=status.HTTP_400_BAD_REQUEST)

            self.queryset.bulk_create(records)
            return Response(response, status=status.HTTP_201_CREATED)

        return Response({
            'status': 'Bad request',
            'message': error
        }, status=status.HTTP_400_BAD_REQUEST)
