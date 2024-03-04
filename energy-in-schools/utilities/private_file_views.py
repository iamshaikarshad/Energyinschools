import os
from datetime import timedelta
from private_storage.views import PrivateStorageView

from utilities.private_files_utils import signer, signing


class SignedPrivateStorageView(PrivateStorageView):
    content_disposition = 'attachment'

    def can_access_file(self, private_file):
        try:
            signed_url_params = private_file.request.META['QUERY_STRING']
            if signer.unsign(signed_url_params, max_age=timedelta(days=1)):
                return True
        except (KeyError, signing.BadSignature, signing.SignatureExpired):
            return False

    def get_content_disposition_filename(self, private_file):
        """
        Return the filename in the download header.
        """
        return self.content_disposition_filename or os.path.basename(private_file.relative_name)
