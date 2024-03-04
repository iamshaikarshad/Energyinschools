from django.core import signals as core_signals
from django.db import connections

from samsung_school.celery_ import app as celery_app

from configurations import importer

importer.install(check_options=True)

__all__ = ('celery_app',)


def close_connection(**_):  # fix SqlAlchemy integration
    for conn in connections.all():
        if hasattr(conn, 'sa_session'):
            conn.sa_session.close()


core_signals.request_finished.connect(close_connection)
