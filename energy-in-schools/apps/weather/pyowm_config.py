from datetime import timedelta

# noinspection PyUnresolvedReferences
from pyowm.weatherapi25.configuration25 import *

from utilities.caching import DefaultTimeoutRedisCache

WEATHER_CACHE_TIME = timedelta(hours=1)

cache = DefaultTimeoutRedisCache(WEATHER_CACHE_TIME)
API_AVAILABILITY_TIMEOUT = 5
