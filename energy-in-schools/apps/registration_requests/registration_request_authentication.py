from typing import NamedTuple
from apps.auth_token.userless_authentication import CustomUserlessJWTAuthentication


class RegistrationRequestAuthentication(CustomUserlessJWTAuthentication):
    class Payload(NamedTuple):
        registration_request_id: int

    queryset_filter_model_field = 'id'
    queryset_filter_payload_field = 'registration_request_id'


class CheckStatusAuth(RegistrationRequestAuthentication):
    token_type = 'registration_request_check_status'


class SubmitQuestionnaireAuth(RegistrationRequestAuthentication):
    token_type = 'registration_request_submit_questionnaire'


class EndTrainingSessionAuth(RegistrationRequestAuthentication):
    token_type = 'registration_request_end_training_session'
