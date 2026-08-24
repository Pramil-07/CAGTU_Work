from django.core.cache import caches
from abc import ABC, abstractmethod
from typing import OrderedDict
from apps.core.utils import get_matched_items
import functools
from django.http import JsonResponse

class AbstractCacheHandler(ABC):

    @classmethod
    @abstractmethod
    def set(cls, key: str, data: OrderedDict, duration: int, *args, **kwargs):
        pass

    @classmethod
    @abstractmethod
    def get(cls, key: str, *args, **kwargs):
        pass

    @classmethod
    @abstractmethod
    def delete(cls, key: str):
        pass

    @classmethod
    @abstractmethod
    def flush(cls):
        pass


class CustomCache(AbstractCacheHandler):
    cache = caches["default"]

    @classmethod
    def set(cls, key: str, data: OrderedDict, duration: int, *args, **kwargs):
        print(f"Setting cache key: {key}")
        cls.cache.set(key.format(*args, **kwargs), data, duration)

    @classmethod
    def get(cls, key: str, *args, **kwargs) -> OrderedDict:
        return cls.cache.get(key.format(*args, **kwargs))

    @classmethod
    def delete(cls, key: str) -> bool | None:
        return cls.cache.delete_many(get_matched_items(cls.cache.keys("*"), key))

    @classmethod
    def flush(cls):
        return cls.cache.delete_many(cls.cache.keys("*"))

    @classmethod
    def cache_response(cls, key_pattern: str, timeout: int = 60):
        import re
        import functools
        from django.http import JsonResponse

        def decorator(func):
            @functools.wraps(func)
            def wrapper(view_instance, request, *args, **kwargs):
                # Merge kwargs + query params
                context = {**kwargs, **request.query_params.dict()}

                # Handle {request.user.id}
                cache_key = re.sub(
                    r"{request\.user\.id}",
                    str(getattr(request.user, "id", "")),
                    key_pattern,
                )

                try:
                    cache_key = cache_key.format(**context)
                except KeyError:
                    # If some placeholder not found, just skip caching
                    return func(view_instance, request, *args, **kwargs)

                cached_data = cls.get(cache_key)
                if cached_data:
                    return JsonResponse(cached_data, safe=False)

                response = func(view_instance, request, *args, **kwargs)
                data = getattr(response, "data", None) or getattr(response, "content", None)
                if data:
                    cls.set(cache_key, getattr(response, "data", response), timeout, *args, **kwargs)
                return response

            return wrapper

        return decorator

