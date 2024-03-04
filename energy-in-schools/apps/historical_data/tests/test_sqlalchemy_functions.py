from calendar import monthrange
from datetime import datetime, timezone

from aldjemy.orm import get_session
from dateutil.relativedelta import relativedelta
from sqlalchemy import select

from apps.historical_data.utils.sqlalchemy_functions import get_days_between, get_days_in_month, get_days_in_year, \
    get_months_between
from apps.main.base_test_case import BaseTestCase


class TestSqlAlchemyFunctions(BaseTestCase):
    def test_get_days_between(self):
        for from_, to, days in (
                (datetime(2000, 1, 1, 23, 59, 59, tzinfo=timezone.utc),
                 datetime(2000, 1, 1, 23, 59, 59, tzinfo=timezone.utc),
                 0),
                (datetime(2000, 1, 1, 23, 59, 59, tzinfo=timezone.utc),
                 datetime(2000, 1, 2, tzinfo=timezone.utc),
                 0),
                (datetime(2000, 1, 1, tzinfo=timezone.utc),
                 datetime(2000, 1, 1, 11, tzinfo=timezone.utc),
                 0),
                (datetime(2000, 1, 1, tzinfo=timezone.utc),
                 datetime(2000, 1, 1, 12, tzinfo=timezone.utc),
                 1),
                (datetime(2000, 1, 1, tzinfo=timezone.utc),
                 datetime(2000, 1, 1, 23, 59, 59, tzinfo=timezone.utc),
                 1),
                (datetime(2000, 1, 1, tzinfo=timezone.utc),
                 datetime(2000, 3, 1, tzinfo=timezone.utc),
                 60),
                (datetime(2000, 1, 1, tzinfo=timezone.utc),
                 datetime(2003, 2, 2, tzinfo=timezone.utc),
                 1128),
        ):
            with self.subTest(f'{relativedelta(to, from_)} - {(to - from_).days} - {days}'):
                self.assertEqual(days, self._execute(get_days_between(from_, to, True)))

    def test_get_month_between(self):
        for from_, to, months in (
                (datetime(2000, 1, 1, 23, 59, 59, tzinfo=timezone.utc),
                 datetime(2000, 1, 1, 23, 59, 59, tzinfo=timezone.utc),
                 0),
                (datetime(2000, 1, 16, tzinfo=timezone.utc),
                 datetime(2000, 2, 1, tzinfo=timezone.utc),
                 0),
                (datetime(2000, 1, 15, tzinfo=timezone.utc),
                 datetime(2000, 2, 1, tzinfo=timezone.utc),
                 1),
                (datetime(2000, 1, 1, tzinfo=timezone.utc),
                 datetime(2003, 2, 20, tzinfo=timezone.utc),
                 3 * 12 + 2),
        ):
            with self.subTest(f'{relativedelta(to, from_)} - {months}'):
                self.assertEqual(months, self._execute(get_months_between(from_, to, True)))

    def test_get_days_in_month(self):
        for date in (
                (datetime(2000, 1, 1, 23, 59, 59, tzinfo=timezone.utc)),
                (datetime(2000, 1, 16, tzinfo=timezone.utc)),
                (datetime(2000, 1, 1, tzinfo=timezone.utc)),
                *(datetime(2000, 1, 1, tzinfo=timezone.utc) + relativedelta(months=months_delta)
                  for months_delta in range(5 * 12))
        ):
            days = monthrange(date.year, date.month)[1]
            with self.subTest(f'{date} - {days}'):
                self.assertEqual(days, self._execute(get_days_in_month(date)))

    def test_get_days_in_year(self):
        for date in (
                datetime(2000, 1, 1, tzinfo=timezone.utc) + relativedelta(years=years_delta)
                for years_delta in range(5)
        ):
            days = (date + relativedelta(years=1) - date).days
            with self.subTest(f'{date} - {days}'):
                self.assertEqual(days, self._execute(get_days_in_year(date)))

    @staticmethod
    def _execute(expression):
        return list(get_session().execute(select([expression])))[0][0]

    def test_(self):
        from_ = datetime(2000, 10, 10, 10, 0, tzinfo=timezone.utc)
        to = datetime(2003, 10, 10, 11, 30, tzinfo=timezone.utc)

        print(self._execute(get_days_between(from_, to, True)))
        print(self._execute(get_months_between(from_, to, True)))
