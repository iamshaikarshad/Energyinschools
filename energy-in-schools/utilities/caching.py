from datetime import timedelta

from cacheops import CacheMiss, RedisCache, cache as redis_cache

EMPTY = object()


class DefaultTimeoutRedisCache:
    def __init__(self, default_timeout: timedelta):
        self.default_timeout = default_timeout

    def set(self, cache_key, data, timeout=EMPTY):
        redis_cache.set(cache_key, data, self.default_timeout if timeout is EMPTY else timeout)

    @staticmethod
    def get(cache_key):
        try:
            return redis_cache.get(cache_key)
        except CacheMiss:
            return None

    @staticmethod
    def delete(cache_key):
        redis_cache.delete(cache_key)


class NotNoneRedisCache(RedisCache):
    """
    Extends RedisCache from cacheops, but ignores None values
    """

    def set(self, cache_key, data, timeout=None):
        if data is None:
            return
        super().set(cache_key, data, timeout)
