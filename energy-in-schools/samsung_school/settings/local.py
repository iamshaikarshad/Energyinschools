import os
from datetime import timedelta

from samsung_school.settings.base import Base, ConfigurationName, PROJECT_ROOT


class Local(Base):
    CONFIGURATION_NAME = ConfigurationName.LOCAL
    MEDIA_ROOT = os.path.join(PROJECT_ROOT, 'media')
    PRIVATE_STORAGE_ROOT = os.path.join(PROJECT_ROOT, 'private_media')

    ALLOWED_HOSTS = [
        '127.0.0.1',
        'localhost',
        '*',
    ]

    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'energy-in-schools-staging',
            'USER': 'energy_in_schools_db_admin',
            'PASSWORD': 'eis-2-DB-pass',
            'HOST': 'energy-in-schools.postgres.database.azure.com',
            'PORT': 5432,
        }
    }

    SIMPLE_JWT = {
        'ACCESS_TOKEN_LIFETIME': timedelta(weeks=5),
        'REFRESH_TOKEN_LIFETIME': timedelta(weeks=1),
    }

    # Parameter should be set as False only in localhost, to prevent deleting devices while
    # refreshing devices with dummy SmartThings apps for testing purposes
    DELETE_DEVICES_ON_REFRESH = False
