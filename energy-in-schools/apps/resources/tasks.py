from apps.historical_data.models import DetailedHistoricalData
from apps.resources.models import PullSupportedResource, Resource
from apps.smart_things_apps.types import AuthCredentialsError
from samsung_school import celery_app
from utilities.sqlalchemy_helpers import close_sa_session


def get_resource_child_model(resource_id: int) -> PullSupportedResource:  # todo: add cache
    resource: Resource = Resource.objects.get(id=resource_id)

    return getattr(resource, resource.child_type.value)


@celery_app.task(ignore_result=True)
@close_sa_session
def select_resources_for_collecting_new_values():
    for resource in Resource.get_resources_for_collecting_new_value():
        fetch_new_values.delay(resource.id)


@celery_app.task(ignore_result=True, autoretry_for=(AuthCredentialsError,), retry_kwargs={'max_retries': 3, 'countdown': 0.5})
@close_sa_session
def fetch_new_values(resource_id: int):
    get_resource_child_model(resource_id).collect_new_values()


@celery_app.task(ignore_result=True)
@close_sa_session
def detailed_energy_history_remove_old_rows():
    DetailedHistoricalData.remove_old_rows()


@celery_app.task(ignore_result=True)
@close_sa_session
def select_resources_for_saving_values_to_long_term_history():
    for resource in Resource.get_resources_for_saving_values_for_long_term():
        save_values_to_long_term_history.delay(resource.id)


@celery_app.task(ignore_result=True)
@close_sa_session
def save_values_to_long_term_history(resource_id: int):
    get_resource_child_model(resource_id).save_data_to_long_term_history()
