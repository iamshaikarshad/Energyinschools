from functools import partial
from typing import cast

from apps.energy_meters.models import EnergyMeter
from apps.energy_providers.models import EnergyProviderAccount
from apps.historical_data.utils.aggregation_params_manager import AggregationOption, AggregationParams, \
    AggregationParamsManager, PreConverter
from apps.historical_data.utils.aggregation_params_utils import avg_func, combine, count_func, one_if_equal, sum_func, \
    to_kilo, watts_to_watt_hours, zero_or_more
from apps.historical_data.utils.button_events_aggregation_utils import ButtonAggregationOption
from apps.historical_data.utils.energy_cost_calculation_utils import CostAggregationOption, \
    aggregate_tariff_by_resources, \
    calculate_watt_hour_cash_back, calculate_watt_hour_cost, get_daily_cash_back, get_fixed_price_cost_fields, \
    join_cash_back_tariff, join_normal_tariff, tariff_by_resources_step_pre_process_query
from apps.locations.models import Location
from apps.resources.models import Resource
from apps.resources.types import ButtonState, ContactState, MotionState, Unit
from apps.smart_things_sensors.models import SmartThingsEnergyMeter, SmartThingsSensor


AggregationParamsManager().register_aggregation_params(AggregationParams(
    source_unit=Unit.WATT,
    target_unit=Unit.WATT,
    aggregate_by_time=avg_func,
    aggregate_by_resources=sum_func
))

AggregationParamsManager().register_aggregation_params(AggregationParams(
    source_unit=Unit.WATT,
    target_unit=Unit.KILOWATT,
    aggregate_by_time=avg_func,
    aggregate_by_resources=sum_func,
    pre_converter=to_kilo
))

AggregationParamsManager().register_aggregation_params(AggregationParams(
    source_unit=Unit.WATT,
    target_unit=Unit.WATT_HOUR,
    aggregate_by_time=sum_func,
    aggregate_by_resources=sum_func,
    pre_converter=watts_to_watt_hours
))

AggregationParamsManager().register_aggregation_params(AggregationParams(
    source_unit=Unit.WATT,
    target_unit=Unit.KILOWATT_HOUR,
    aggregate_by_time=sum_func,
    aggregate_by_resources=sum_func,
    pre_converter=combine(watts_to_watt_hours, to_kilo)
))

AggregationParamsManager().register_aggregation_params(AggregationParams(
    source_unit=Unit.WATT,
    target_unit=Unit.POUND_STERLING,
    aggregate_by_time=sum_func,
    aggregate_by_resources=sum_func,
    pre_converter=combine(watts_to_watt_hours, calculate_watt_hour_cost),
    join_extra_models=join_normal_tariff,
    models_to_join=(Resource, Location, EnergyMeter, SmartThingsSensor, SmartThingsEnergyMeter, EnergyProviderAccount),
    aggregation_option=CostAggregationOption.WATT_HOUR_COST,
))

AggregationParamsManager().register_aggregation_params(AggregationParams(
    source_unit=Unit.WATT,
    target_unit=Unit.POUND_STERLING,
    aggregate_by_time=sum_func,
    aggregate_by_resources=aggregate_tariff_by_resources,
    pre_converter=combine(watts_to_watt_hours, calculate_watt_hour_cost),
    by_resources_step_pre_process_query=tariff_by_resources_step_pre_process_query,
    get_by_time_step_extra_fields=get_fixed_price_cost_fields,
    join_extra_models=join_normal_tariff,
    models_to_join=(Resource, Location, EnergyMeter, SmartThingsSensor, SmartThingsEnergyMeter, EnergyProviderAccount),
    aggregation_option=CostAggregationOption.FULL_COST,
))

AggregationParamsManager().register_aggregation_params(AggregationParams(
    source_unit=Unit.WATT,
    target_unit=Unit.POUND_STERLING,
    aggregate_by_time=combine(sum_func, zero_or_more),
    aggregate_by_resources=sum_func,
    pre_converter=combine(watts_to_watt_hours, calculate_watt_hour_cash_back),
    join_extra_models=join_cash_back_tariff,
    models_to_join=(Resource, Location, EnergyMeter, SmartThingsSensor, SmartThingsEnergyMeter, EnergyProviderAccount),
    aggregation_option=CostAggregationOption.CASH_BACK_SUB_QUERY,
))

AggregationParamsManager().register_aggregation_params(AggregationParams(
    source_unit=Unit.WATT,
    target_unit=Unit.POUND_STERLING,
    aggregate_by_time=sum_func,
    aggregate_by_resources=sum_func,
    by_resources_step_pre_process_query=get_daily_cash_back,
    aggregation_option=CostAggregationOption.CASH_BACK,
))

AggregationParamsManager().register_aggregation_params(
    AggregationParams(
        source_unit=Unit.CELSIUS,
        target_unit=Unit.CELSIUS,
        aggregate_by_time=avg_func,
        aggregate_by_resources=avg_func,
    )
)

AggregationParamsManager().register_aggregation_params(
    AggregationParams(
        source_unit=Unit.UNKNOWN,
        target_unit=Unit.UNKNOWN,
        aggregate_by_time=avg_func,
        aggregate_by_resources=avg_func,
    )
)

AggregationParamsManager().register_aggregation_params(
    AggregationParams(
        source_unit=Unit.BUTTON_STATE,
        target_unit=Unit.EVENTS_COUNT,
        aggregate_by_time=count_func,
        aggregate_by_resources=sum_func,
        aggregation_option=cast(AggregationOption, ButtonAggregationOption.ANY),
    )
)

for aggregation_option, button_state in (
        (ButtonAggregationOption.PUSHED, ButtonState.PUSHED),
        (ButtonAggregationOption.DOUBLE, ButtonState.DOUBLE),
        (ButtonAggregationOption.HELD, ButtonState.HELD),
):
    AggregationParamsManager().register_aggregation_params(
        AggregationParams(
            source_unit=Unit.BUTTON_STATE,
            target_unit=Unit.EVENTS_COUNT,
            pre_converter=cast(PreConverter, partial(one_if_equal, target_value=button_state.int_value)),
            aggregate_by_time=sum_func,
            aggregate_by_resources=sum_func,
            aggregation_option=cast(AggregationOption, aggregation_option)
        )
    )

AggregationParamsManager().register_aggregation_params(
    AggregationParams(
        source_unit=Unit.MOTION_STATE,
        target_unit=Unit.EVENTS_COUNT,
        pre_converter=cast(PreConverter, partial(one_if_equal, target_value=MotionState.ACTIVE.int_value)),
        aggregate_by_time=sum_func,
        aggregate_by_resources=sum_func,
    )
)

AggregationParamsManager().register_aggregation_params(
    AggregationParams(
        source_unit=Unit.CONTACT_STATE,
        target_unit=Unit.EVENTS_COUNT,
        pre_converter=cast(PreConverter, partial(one_if_equal, target_value=ContactState.OPEN.int_value)),
        aggregate_by_time=sum_func,
        aggregate_by_resources=sum_func,
    )
)
