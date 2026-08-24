def invalidate_cache(pattern: str):
    """
    Delete cache keys by wildcard pattern (requires django-redis backend).
    """
    from django.core.cache import caches
    redis_cache = caches["default"]

    keys = redis_cache.keys(pattern)
    if keys:
        redis_cache.delete_many(keys)