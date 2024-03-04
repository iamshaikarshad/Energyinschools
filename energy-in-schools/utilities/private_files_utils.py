import os
from typing import Any, Callable

from samsung_school.settings.base import AZURE_MEDIA_URL
from django.core import signing

signer = signing.TimestampSigner(sep='~')


def get_file_path_maker(folder: str, function_name: str, module_name: str) -> Callable[[Any, str], str]:
    def make_file_path(_, filename: str):
        return os.path.join(folder, filename)

    make_file_path.__name__ = function_name
    make_file_path.__qualname__ = function_name
    make_file_path.__module__ = module_name

    return make_file_path


def get_azure_path(file):
    return AZURE_MEDIA_URL + '/' + file if file else ''
