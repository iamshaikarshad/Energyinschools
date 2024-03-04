import os

from samsung_school.settings.base import Base, ConfigurationName

# from utilities.aws_utils import boto3_session

LOGS_DIRECTORY = '/home/site/wwwroot/app-logs'


class Staging(Base):
    CONFIGURATION_NAME = ConfigurationName.STAGING
    DEBUG = False
    MEDIA_ROOT = '/home/site/wwwroot/media'

    ALLOWED_HOSTS = [
        # 'staging.energyinschools.co.uk',
        # 'www.staging.energyinschools.co.uk',
        # TODO: remove after domain is moved to azure
        'energy-in-schools-staging.azurewebsites.net'
    ]

    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', ''),
            'USER': os.environ.get('DB_USER', ''),
            'PASSWORD': os.environ.get('DB_PASS', ''),
            'HOST': os.environ.get('DB_HOST', ''),
            'PORT': os.environ.get('DB_PORT', ''),
        }
    }

    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'verbose': {
                'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
            },
            'aws': {
                'format': u"%(asctime)s [%(levelname)-8s] %(message)s",
                'datefmt': "%Y-%m-%d %H:%M:%S"
            },
        },
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
        },
        'loggers': {
            'django.request': {
                'handlers': ['django.request'],
                'level': 'ERROR',
                'propagate': False,
            },
            '': {
                'handlers': ['root'],
                'level': 'INFO',
                'propagate': False,
            },
        },
    }

    # TODO: use azure email service???
    # EMAIL_BACKEND = 'django_amazon_ses.EmailBackend'
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

    EMAIL_HOST = os.environ.get('EMAIL_HOST', None)
    EMAIL_PORT = os.environ.get('EMAIL_PORT', None)
    EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', None)
    EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', None)
    EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', None)
    EMAIL_USE_SSL = os.environ.get('EMAIL_USE_SSL', None)
    EMAIL_TIMEOUT = os.environ.get('EMAIL_TIMEOUT', None)
    EMAIL_SSL_KEYFILE = os.environ.get('EMAIL_SSL_KEYFILE', None)
    EMAIL_SSL_CERTFILE = os.environ.get('EMAIL_SSL_CERTFILE', None)


    MQTT_CERTIFICATES_FOLDER = '/etc/pki/tls/certs/'

    CORS_ORIGIN_ALLOW_ALL = False
    CORS_ORIGIN_REGEX_WHITELIST = (
        r'^(https?://)?(\w+\.)?energyinschools\.co\.uk$',
        # TODO: remove after domain is moved to azure
        r'^(https?://)?(\w+\.)?energy\-in\-schools\.azurewebsites\.net$'
    )
    CORS_ALLOW_HEADERS = (
        'accept',
        'accept-encoding',
        'authorization',
        'content-type',
        'dnt',
        'origin',
        'user-agent',
        'x-csrftoken',
        'x-requested-with',
        'cache-control',
    )

    CREDENTIALS_RECEIVERS_TRAINING_PERIOD = (
        "zerk.shaban@myutilitygenius.co.uk",
        "shaik.arshad@myutilitygenius.co.uk",
    )
