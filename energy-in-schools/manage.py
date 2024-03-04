#!/usr/bin/env python
import os
import sys

# PyCharm fix
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "samsung_school.settings")
os.environ.setdefault("DJANGO_CONFIGURATION", "Local")

if sys.argv and sys.argv[0].find('django_test_manage.py'):
    import configurations

    configurations.setup()

if __name__ == "__main__":
    try:
        import django  # noqa
    except ImportError:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        )

    from configurations.management import execute_from_command_line

    execute_from_command_line(sys.argv)
