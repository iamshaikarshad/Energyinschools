from http import HTTPStatus

import private_storage.permissions
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.db.transaction import atomic
from django.forms import model_to_dict
from django.template.loader import get_template
from drf_yasg.openapi import Schema
from drf_yasg.utils import swagger_auto_schema
from private_storage.views import PrivateStorageDetailView
from rest_framework import mixins
from rest_framework.decorators import action
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.settings import api_settings
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from apps.hubs.models import Hub, HubType
from apps.accounts.models import User
from apps.addresses.models import Address
from apps.auth_token.userless_authentication import IsUserlessAuthentication
from apps.locations.decorators import own_location_only
from apps.locations.models import Location
from apps.registration_requests.models import RegistrationRequest
from apps.registration_requests.serializers import DeclineActivationRequestSerializer, \
    DeclineRegistrationRequestSerializer, QuestionnaireSerializer, \
    RegistrationRequestEmptySerializer, RegistrationRequestSerializer
from apps.registration_requests.registration_request_authentication import CheckStatusAuth, SubmitQuestionnaireAuth,\
    EndTrainingSessionAuth
from apps.registration_requests.utils import create_or_update_school_members, \
    send_credentials_via_email, send_email_notification_by_template, send_email_notification_by_template_to_admins, \
    update_registration_request
from apps.weather.models import WeatherTemperatureHistory
from utilities.swagger_helpers import post_action_swagger_auto_schema


class RegistrationRequestsViewSet(mixins.CreateModelMixin,
                                  mixins.RetrieveModelMixin,
                                  mixins.ListModelMixin,
                                  GenericViewSet):
    serializer_class = RegistrationRequestSerializer

    @own_location_only
    def get_queryset(self):
        queryset = RegistrationRequest.objects.select_related(
            'address',
            'it_manager',
            'school_manager',
            'utilities_manager',
            'questionnaire',
        )

        if self.action in (
                self.accept_trial.__name__,
                self.reject_trial.__name__,
        ):
            queryset = queryset.filter(status=RegistrationRequest.Status.TRIAL_PENDING)

        elif self.action in (
                self.accept_activation.__name__,
                self.reject_activation.__name__
        ):
            queryset = queryset.filter(status=RegistrationRequest.Status.ACTIVATION_PENDING)
        elif self.action in (
                self.list.__name__,
                self.retrieve.__name__,
        ):
            pass

        else:
            queryset = queryset.none()

        return queryset

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]

        else:
            return super().get_permissions()

    @atomic
    def perform_create(self, serializer: RegistrationRequestSerializer):
        super().perform_create(serializer)
        send_email_notification_by_template_to_admins(
            subject=f'Received new school registration request from {serializer.instance.school_name}',
            template=get_template('registration-requests/new-registration-request-email.html')
        )
        send_email_notification_by_template(
            to=serializer.instance.email,
            subject=f'{serializer.instance.school_name} created school registration request',
            template=get_template('registration-requests/school-registration-request-created-email.html'),
            parameters=dict(
                registration_request_status_link=settings.LINKS.CHECK_REGISTRATION_REQUEST_STATUS.format(
                    token=CheckStatusAuth.obtain_token(
                        CheckStatusAuth.Payload(
                            registration_request_id=serializer.instance.id,
                        )
                    ),
                )
            )
        )

    @post_action_swagger_auto_schema(request_body=RegistrationRequestEmptySerializer)
    @action(methods=['post'], detail=True, url_path='accept-trial')
    @atomic
    def accept_trial(self, request, *_, **__):
        registration_request = self.get_object()

        location = Location.objects.create(
            name=registration_request.school_name,
            description=registration_request.comment,
            address=Address.objects.create(**model_to_dict(registration_request.address, exclude=['id'])),
        )

        update_registration_request(
            request=request,
            serializer_class=RegistrationRequestEmptySerializer,
            registration_request=registration_request,
            status=RegistrationRequest.Status.TRAINING_PERIOD,
            registered_school=location,
        )

        WeatherTemperatureHistory.objects.create(sub_location=location, )

        # Create at least one webhub to improve school UX after registration
        Hub.objects.create(sub_location=location, name=f'{registration_request.school_name} Webhub', type=HubType.BROWSER)

        csv_text = create_or_update_school_members(location, registration_request)
        send_credentials_via_email(
            school_name=registration_request.school_name,
            csv_text=csv_text,
            template='registration-requests/school-registration-training-period.html',
            receivers=settings.CREDENTIALS_RECEIVERS_TRAINING_PERIOD,
            parameters=dict(
                end_training_session_link=settings.LINKS.END_TRAINING_PERIOD.format(
                    token=EndTrainingSessionAuth.obtain_token(
                        EndTrainingSessionAuth.Payload(
                            registration_request_id=registration_request.id
                        )
                    ),
                    id=registration_request.id
                )
            )
        )

        return Response()

    @post_action_swagger_auto_schema(request_body=DeclineRegistrationRequestSerializer)
    @action(methods=['post'], detail=True, url_path='reject-trial')
    @atomic
    def reject_trial(self, request, *_, **__):
        registration_request: RegistrationRequest = self.get_object()

        update_registration_request(
            request=request,
            serializer_class=DeclineRegistrationRequestSerializer,
            registration_request=registration_request,
            status=RegistrationRequest.Status.TRIAL_REJECTED
        )

        send_email_notification_by_template(
            subject=f'{registration_request.school_name} registration request was declined',
            to=registration_request.email,
            template=get_template('registration-requests/school-registration-rejected-email.html'),
            parameters=dict(
                reject_reason=registration_request.registration_reject_reason
            )
        )

        return Response()

    @post_action_swagger_auto_schema(request_body=RegistrationRequestEmptySerializer)
    @action(methods=['post'], detail=True, url_path='accept-activation')
    @atomic
    def accept_activation(self, request, *_, **__):
        registration_request: RegistrationRequest = self.get_object()

        update_registration_request(
            request=request,
            serializer_class=RegistrationRequestEmptySerializer,
            registration_request=registration_request,
            status=RegistrationRequest.Status.ACTIVATION_ACCEPTED,
        )

        send_email_notification_by_template(
            subject=f'{registration_request.school_name} registration request was accepted',
            to=registration_request.email,
            template=get_template('registration-requests/school-activation-accepted-email.html'),
            parameters=dict(
                reject_reason=registration_request.registration_reject_reason
            )
        )

        User.objects.filter(location=registration_request.registered_school).update(is_active=True)

        return Response()

    @post_action_swagger_auto_schema(request_body=DeclineActivationRequestSerializer)
    @action(methods=['post'], detail=True, url_path='reject-activation')
    @atomic
    def reject_activation(self, request, *_, **__):
        registration_request: RegistrationRequest = self.get_object()

        update_registration_request(
            request=request,
            serializer_class=DeclineActivationRequestSerializer,
            registration_request=registration_request,
            status=RegistrationRequest.Status.ACTIVATION_REJECTED
        )

        send_email_notification_by_template(
            subject=f'{registration_request.school_name} activation request was declined',
            to=registration_request.email,
            template=get_template('registration-requests/school-activation-rejected-email.html'),
            parameters=dict(
                reject_reason=registration_request.registration_reject_reason
            )
        )

        return Response()


class QuestionnaireSignedLoaApiView(PrivateStorageDetailView, APIView):
    model_file_field = 'signed_loa'
    can_access_file = staticmethod(private_storage.permissions.allow_authenticated)

    @own_location_only
    def get_queryset(self):
        return RegistrationRequest.objects.all()

    def get_object(self, queryset=None):
        return super().get_object(queryset).questionnaire


class SubmitQuestionnaireApiView(GenericAPIView):
    serializer_class = QuestionnaireSerializer
    authentication_classes = (
        SubmitQuestionnaireAuth.authentication_class,
        *api_settings.DEFAULT_AUTHENTICATION_CLASSES,
    )

    def get_permissions(self):
        if isinstance(self.request.user, AnonymousUser):
            return IsUserlessAuthentication(),

        return super().get_permissions()

    @own_location_only
    @SubmitQuestionnaireAuth.filtrate_queryset
    def get_queryset(self):
        return RegistrationRequest.objects.filter(status=RegistrationRequest.Status.TRIAL_ACCEPTED)

    @swagger_auto_schema(methods=['put'],
                         request_body=QuestionnaireSerializer,
                         responses={HTTPStatus.OK.value: HTTPStatus.OK.phrase})
    @action(methods=['put'], detail=True, url_path='questionnaire')
    @atomic
    def put(self, request, *_, **__):
        registration_request: RegistrationRequest = self.get_object()

        serializer = QuestionnaireSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        registration_request.questionnaire = serializer.instance
        registration_request.status = RegistrationRequest.Status.ACTIVATION_PENDING
        registration_request.save()

        send_email_notification_by_template_to_admins(
            subject=f'Received new school activation request from {registration_request.school_name}',
            template=get_template('registration-requests/new-activation-request-email.html')
        )

        return Response()


class RegistrationRequestStatusApiView(GenericAPIView):
    authentication_classes = CheckStatusAuth.authentication_class,
    serializer_class = RegistrationRequestEmptySerializer
    permission_classes = IsUserlessAuthentication,

    @CheckStatusAuth.filtrate_queryset
    def get_queryset(self):
        return RegistrationRequest.objects.all()

    @swagger_auto_schema(responses={
        HTTPStatus.OK.value: Schema(enum=[item.value for item in RegistrationRequest.Status], type='string')
    })
    def get(self, *_, **__):
        return Response(self.get_object().status.value)


class RegistrationRequestEndTrainingSessionApiView(GenericAPIView):
    authentication_classes = (
        EndTrainingSessionAuth.authentication_class,
        *api_settings.DEFAULT_AUTHENTICATION_CLASSES,
    )
    serializer_class = RegistrationRequestEmptySerializer
    permission_classes = (IsAdminUser | IsUserlessAuthentication,)

    @EndTrainingSessionAuth.filtrate_queryset
    def get_queryset(self):
        return RegistrationRequest.objects.filter(status=RegistrationRequest.Status.TRAINING_PERIOD)

    @post_action_swagger_auto_schema(request_body=RegistrationRequestEmptySerializer)
    @action(methods=['post'], detail=True, url_path='end-training-session')
    @atomic
    def post(self, request, *_, **__):
        registration_request = self.get_object()
        update_registration_request(
            request=request,
            serializer_class=RegistrationRequestEmptySerializer,
            registration_request=registration_request,
            status=RegistrationRequest.Status.TRIAL_ACCEPTED
        )

        # TEMPORARY UNAVAILABLE! TO REDUCE CREDENTIALS SHARING STUFF
        # location = registration_request.registered_school
        # csv_text = create_or_update_school_members(location, registration_request)
        # send_credentials_via_email(
        #     school_name=registration_request.school_name,
        #     csv_text=csv_text,
        #     receivers=(registration_request.email,),
        #     template='registration-requests/school-registration-accepted-email.html'
        # )

        return Response(status=HTTPStatus.OK.value)
