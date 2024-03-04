from apps.accounts.permissions import RoleName
from apps.accounts.utils import ModelPermissions


comment = ModelPermissions('Comment')
daily_usage_trigger = ModelPermissions('DailyUsageTrigger')
email_notification = ModelPermissions('EmailNotification')
energy_dashboard_screens = ModelPermissions('DashboardScreen')
energy_meter = ModelPermissions('EnergyMeter')
energy_meter_billing_info = ModelPermissions('EnergyMeterBillingInfo')
energy_provider_account = ModelPermissions('EnergyProviderAccount')
energy_tariff = ModelPermissions('EnergyTariff')
fact = ModelPermissions('Fact')
learning_day = ModelPermissions('LearningDay')
lesson_plan = ModelPermissions('LessonPlan')
lesson_plan_new = ModelPermissions('LessonPlanNew')
location = ModelPermissions('Location')
manual = ModelPermissions('Manual')
manual_category = ModelPermissions('Category')
manual_media_files = ModelPermissions('ManualMediaFile')
microbit_historical_data_set = ModelPermissions('MicrobitHistoricalDataSet')
microbit_variable = ModelPermissions('MicrobitVariable')
notification_event_log = ModelPermissions('NotificationEventLog')
notification_target = ModelPermissions('NotificationTarget')
notification_trigger = ModelPermissions('NotificationTrigger')
pupils = ModelPermissions('Pupils')
raspberry_hub = ModelPermissions('Hub')
registration_request = ModelPermissions('RegistrationRequest')
resource = ModelPermissions('Resource')
smart_things_app = ModelPermissions('SmartThingsApp')
smart_things_device = ModelPermissions('SmartThingsDevice')
smart_things_sensor = ModelPermissions('SmartThingsSensor')
smart_things_energy_meter = ModelPermissions('SmartThingsEnergyMeter')
theme = ModelPermissions('Theme')
topic = ModelPermissions('Topic')
user = ModelPermissions('User')
value_level_trigger = ModelPermissions('ValueLevelTrigger')
weather_temperature_history = ModelPermissions('WeatherTemperatureHistory')

GROUP_PERMISSIONS = {
    RoleName.ADMIN: (

        *manual.all_permissions,
        *manual_category.all_permissions,
        *manual_media_files.all_permissions,
        *registration_request.all_permissions,
        *smart_things_app.all_permissions,
        *comment.all_permissions,
    ),
    RoleName.SLE_ADMIN: (
        'manage_sme_admins',
        'manage_teachers',
        'manage_pupils',

        energy_provider_account.view_permission,
        energy_tariff.view_permission,
        manual.view_permission,
        manual_category.view_permission,
        manual_media_files.view_permission,
        registration_request.change_permission,
        registration_request.view_permission,
        resource.view_permission,
        smart_things_sensor.change_permission,
        smart_things_sensor.view_permission,
        smart_things_energy_meter.change_permission,
        smart_things_energy_meter.view_permission,
        user.change_permission,
        user.view_permission,
        weather_temperature_history.view_permission,

        *comment.all_permissions,
        *daily_usage_trigger.all_permissions,
        *email_notification.all_permissions,
        *energy_meter.all_permissions,
        *energy_meter_billing_info.all_permissions,
        *learning_day.all_permissions,
        *lesson_plan.all_permissions,
        *lesson_plan_new.all_permissions,
        *location.all_permissions,
        *microbit_historical_data_set.all_permissions,
        *microbit_variable.all_permissions,
        *notification_target.all_permissions,
        *notification_trigger.all_permissions,
        *raspberry_hub.all_permissions,
        *smart_things_device.all_permissions,
        *topic.all_permissions,
        *value_level_trigger.all_permissions,
    ),
    RoleName.SEM_ADMIN: (
        manual.view_permission,
        manual_category.view_permission,
        manual_media_files.view_permission,
        resource.view_permission,
        smart_things_sensor.change_permission,
        smart_things_sensor.view_permission,
        smart_things_energy_meter.change_permission,
        smart_things_energy_meter.view_permission,
        user.view_permission,

        *comment.all_permissions,
        *daily_usage_trigger.all_permissions,
        *email_notification.all_permissions,
        *energy_meter.all_permissions,
        *energy_meter_billing_info.all_permissions,
        *energy_provider_account.all_permissions,
        *energy_tariff.all_permissions,
        *location.all_permissions,
        *raspberry_hub.all_permissions,
        *microbit_historical_data_set.all_permissions,
        *microbit_variable.all_permissions,
        *notification_event_log.all_permissions,
        *notification_target.all_permissions,
        *notification_trigger.all_permissions,
        *smart_things_device.all_permissions,
        *topic.all_permissions,
        *value_level_trigger.all_permissions,
        *weather_temperature_history.all_permissions,
    ),
    RoleName.TEACHER: (
        energy_meter.view_permission,
        energy_provider_account.view_permission,
        energy_tariff.view_permission,
        lesson_plan.view_permission,
        lesson_plan_new.view_permission,
        location.view_permission,
        manual.view_permission,
        manual_category.view_permission,
        manual_media_files.view_permission,
        raspberry_hub.view_permission,
        resource.view_permission,
        smart_things_device.view_permission,
        smart_things_sensor.view_permission,
        user.view_permission,
        weather_temperature_history.view_permission,

        *comment.all_permissions,
        *microbit_historical_data_set.all_permissions,
        *microbit_variable.all_permissions,
        *topic.all_permissions,
    ),
    RoleName.PUPIL: (
        energy_meter.view_permission,
        energy_provider_account.view_permission,
        energy_tariff.view_permission,
        lesson_plan.view_permission,
        lesson_plan_new.view_permission,
        location.view_permission,
        manual.view_permission,
        manual_category.view_permission,
        manual_media_files.view_permission,
        microbit_variable.view_permission,
        raspberry_hub.view_permission,
        resource.view_permission,
        smart_things_device.view_permission,
        smart_things_sensor.view_permission,
        user.view_permission,
        weather_temperature_history.view_permission,

        *microbit_historical_data_set.all_permissions,
        *microbit_variable.all_permissions,
    ),
    RoleName.ES_ADMIN: (
        'manage_energy_screen',

        energy_meter.view_permission,
        energy_provider_account.view_permission,
        location.view_permission,
        manual.view_permission,
        manual_category.view_permission,
        manual_media_files.view_permission,
        smart_things_sensor.view_permission,
        user.view_permission,

        *fact.all_permissions,
        *theme.all_permissions,
    ),
    RoleName.ES_USER: (
        'view_energy_screen',

        resource.view_permission,
        energy_meter.view_permission,
        location.view_permission,
        smart_things_sensor.view_permission,
        user.view_permission,
        energy_dashboard_screens.view_permission,

        fact.view_permission,
        theme.view_permission,

        energy_tariff.view_permission,

    ),
    RoleName.MUG_USER: (
        user.view_permission,
    )
}
