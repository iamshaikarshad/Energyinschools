from django.utils.translation import ugettext_lazy as _

from apps.notifications.models.notification_triggers import TriggerType


WARNING_TITLES_BY_TRIGGER_TYPE = {
    TriggerType.DAILY_ELECTRICITY_USAGE:
        _('Alert: the use of electricity is greater than usual!'),
    TriggerType.DAILY_GAS_USAGE:
        _('Alert: the use of gas is greater than usual!'),
    TriggerType.ELECTRICITY_CONSUMPTION_LEVEL:
        _('Alert: the electricity consumption is {operator} then {value:.2f} kW!'),
    TriggerType.GAS_CONSUMPTION_LEVEL:
        _('Alert: the gas consumption is {operator} then {value:.2f} kW!'),
    TriggerType.TEMPERATURE_LEVEL:
        _('Alert: the temperature is {operator} then {value:.2f} °C!'),
}

WARNING_MESSAGE_BY_TRIGGER_TYPE = {
    TriggerType.DAILY_ELECTRICITY_USAGE:
        _('The use of electricity in "{location_name}" is more than {value}% bigger than usual!'),
    TriggerType.DAILY_GAS_USAGE:
        _('The use of gas in "{location_name}" is more than {value}% bigger than usual!'),
    TriggerType.ELECTRICITY_CONSUMPTION_LEVEL:
        _('The electricity consumption in "{location_name}" is {operator} then {value:.2f} kW!'),
    TriggerType.GAS_CONSUMPTION_LEVEL:
        _('The gas consumption in "{location_name}" is {operator} then {value:.2f} kW!'),
    TriggerType.TEMPERATURE_LEVEL:
        _('The temperature in "{location_name}" is {operator} then {value:.2f} °C!'),
}
