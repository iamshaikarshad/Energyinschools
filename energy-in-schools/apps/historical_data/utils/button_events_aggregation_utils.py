from apps.historical_data.utils.aggregation_params_manager import AggregationOption


class ButtonAggregationOption(AggregationOption):
    ANY = 'any', True
    PUSHED = 'pushed', False
    DOUBLE = 'double', False
    HELD = 'held', False
