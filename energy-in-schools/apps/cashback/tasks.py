from datetime import datetime, timedelta

import pytz

from apps.cashback.models import OffPeakyPoint
from apps.locations.models import Location
from samsung_school import celery_app
from utilities.sqlalchemy_helpers import close_sa_session


@celery_app.task(ignore_result=True)
@close_sa_session
def calculate_schools_cash_back():
    for location in Location.get_schools():
        """calculate Off Peaky points for yesterday in school's timezone"""
        location_tz: datetime.tzinfo = pytz.timezone(location.timezone)
        local_yesterday: datetime.date = datetime.now(tz=location_tz).date() - timedelta(days=1)

        OffPeakyPoint.create_or_update_for_location(location=location, day=local_yesterday)
