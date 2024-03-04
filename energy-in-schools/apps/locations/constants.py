"""Mapping current consumption in watts to mood integer"""
ENERGY_CONSUMPTION_MOOD_MAPPING = {
    0: 5,
    4000: 5,
    6000: 4,
    8000: 3,
    10000: 2,
    12000: 1,
}

CALCULATE_OFF_PEAKY_POINTS_MESSAGE = 'Successfully calculated off-peaky points for {off_peaky_count} {locations_label}'\
                                     '({created_count} - created, {updated_count} - updated)'
