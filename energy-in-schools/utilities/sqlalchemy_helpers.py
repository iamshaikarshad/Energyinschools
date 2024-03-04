from functools import wraps

from django.db import connections


def close_sa_session(func):
    @wraps(func)
    def wrapped(*args, **kwargs):
        try:
            func(*args, **kwargs)
        finally:
            for conn in connections.all():
                if hasattr(conn, 'sa_session'):
                    conn.sa_session.close()

    return wrapped
