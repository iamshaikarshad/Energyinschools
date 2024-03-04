from samsung_school.settings.base import ConfigurationName
from samsung_school.settings.staging import LOGS_DIRECTORY, Staging
# from utilities.aws_utils import boto3_session


class Production(Staging):
    CONFIGURATION_NAME = ConfigurationName.PRODUCTION
    ALLOWED_HOSTS = [
        # 'energyinschools.co.uk',
        # 'www.energyinschools.co.uk'
        'energy-in-schools-staging.azurewebsites.net',
        'www.energy-in-schools-staging.azurewebsites.net'
    ]

    LOGGING = {
        **Staging.LOGGING,
        'handlers': {
            'django.request': {
                'level': 'ERROR',
                'class': 'logging.FileHandler',
                'filename': f'{LOGS_DIRECTORY}/django-requests.log',
                'formatter': 'verbose'
            },
            'root': {
                'level': 'INFO',
                'class': 'logging.FileHandler',
                'filename': f'{LOGS_DIRECTORY}/application.log',
                'formatter': 'verbose'
            },
            # 'watchtower': {
            #     'level': 'ERROR',
            #     'class': 'watchtower.CloudWatchLogHandler',
            #     'boto3_session': boto3_session,
            #     'log_group': 'ApplicationLog',
            #     'stream_name': 'ApplicationLogStreamProduction',
            #     'formatter': 'aws',
            # },
        },
    }

    TEST_MODE = False

    CREDENTIALS_RECEIVERS_TRAINING_PERIOD = (
        "zerk.shaban@myutilitygenius.co.uk",
        "shaik.arshad@myutilitygenius.co.uk"
    )

    # MUG_AUTH_API_URL = 'https://userauthorisation.myutilitygenius.co.uk/api/authentication'
    # MUG_API_URL = 'https://business-home-api.myutilitygenius.co.uk'
    MUG_AUTH_API_URL = 'https://myutilitygenius-userauthorisation-test.azurewebsites.net/api/authentication'
    MUG_API_URL = 'https://myutilitygenius-business-home-api-test.azurewebsites.net'