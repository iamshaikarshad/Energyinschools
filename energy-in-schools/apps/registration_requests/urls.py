from django.urls import include, path
from rest_framework import routers

from apps.registration_requests.views import QuestionnaireSignedLoaApiView, RegistrationRequestStatusApiView, \
    RegistrationRequestsViewSet, SubmitQuestionnaireApiView, RegistrationRequestEndTrainingSessionApiView


registration_request_router = routers.DefaultRouter()
registration_request_router.register('', RegistrationRequestsViewSet, 'registration-requests')

urlpatterns = [
    path('', include(registration_request_router.urls)),
    path('<int:pk>/questionnaire/signed-loa/', QuestionnaireSignedLoaApiView.as_view()),
    path('<int:pk>/questionnaire/', SubmitQuestionnaireApiView.as_view()),
    path('<int:pk>/status/', RegistrationRequestStatusApiView.as_view()),
    path('<int:pk>/end-training-session/', RegistrationRequestEndTrainingSessionApiView.as_view()),
]
