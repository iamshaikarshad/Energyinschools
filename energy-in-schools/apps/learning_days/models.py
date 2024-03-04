from datetime import datetime, date as date_type, timedelta

from django.db import models

from apps.learning_days.settings import DEFAULT_VACATIONS
from apps.locations.models import Location
from apps.main.models import BaseModel


class LearningDay(BaseModel):
    location = models.ForeignKey(Location, null=False, db_index=True, on_delete=models.CASCADE,
                                 related_name='learning_days')
    date = models.DateField(null=False, db_index=True)

    @classmethod
    def create_defaults_for_all_locations(cls):
        for school in Location.get_schools():
            cls.create_defaults_for_school(school)

    @classmethod
    def create_defaults_for_school(cls, school: Location):
        cursor = datetime.now().date()

        if school.learning_days.count():
            cursor = max(
                cursor,
                school.learning_days.order_by('-updated_at').values_list('updated_at', flat=True).first().date(),
                school.learning_days.order_by('-date').values_list('date', flat=True).first(),
            )

        learning_days = []
        end_of_the_learning_year = date_type(year=cursor.year + 1, month=6, day=1)  # to next summer
        while cursor <= end_of_the_learning_year:
            if cls.is_learning_day_by_default(cursor):
                learning_days.append(cls(
                    location=school,
                    date=cursor
                ))

            cursor += timedelta(days=1)

        LearningDay.objects.bulk_create(learning_days)

    @classmethod
    def is_learning_day_by_default(cls, a_date: date_type):
        return a_date.weekday() not in (5, 6) and not any(
            vacation.is_vacation(a_date)
            for vacation in
            DEFAULT_VACATIONS
        )
