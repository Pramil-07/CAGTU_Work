# rest_framework imports
from rest_framework.response import Response
from rest_framework import status
# core imports

from apps.core.serializers import MultipleDeleteSerializer, SpecificMultipleDeleteSerializer
from django.db.models.query import QuerySet
from django.db import IntegrityError


class MultipleDeleteClassMixin(object):
    id_queryset = None
    className = None
    serializer_class = MultipleDeleteSerializer
    """
    the child class inheriting this mixin should have the variable `id_queryset` and 'className'
    with the datatype object for 'id_queryset'  i.e. {Model.objects.all()} and
    with the datatype string for 'className' i.e. 'Model Name'
    """

    def get_id_queryset(self):
        """
        Get the list of items for this view.
        This must be an iterable, and may be a queryset.
        Defaults to using `self.queryset`.

        This method should always be used rather than accessing `self.queryset`
        directly, as `self.queryset` gets evaluated only once, and those results
        are cached for all subsequent requests.

        You may want to override this if you need to provide different
        querysets depending on the incoming request.

        (Eg. return a list of items that is specific to the user)
        """
        assert self.id_queryset is not None, (
            "'%s' should either include a `queryset` attribute, "
            "or override the `get_queryset()` method."
            % self.__class__.__name__
        )

        id_queryset = self.id_queryset
        if isinstance(id_queryset, QuerySet):
            # Ensure queryset is re-evaluated on each request.
            id_queryset = id_queryset.all()
        return id_queryset

    def post(self, request, *args, **kwargs):
        serializer = MultipleDeleteSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            try:
                objects = self.get_id_queryset().filter(pk__in=serializer.validated_data.get('pk'))
            except:
                return Response({"status": "failure", "message": f"Please select proper {self.className}."},
                                status=status.HTTP_400_BAD_REQUEST)
            if not objects:
                return Response({"status": "failure", "message": f"Please select valid {self.className}."},
                                status=status.HTTP_404_NOT_FOUND)

            try:
                objects.delete()
            except IntegrityError as e:
                return Response({"status": 'failure',
                                 "message": "Cannot delete some instances of model. The object is currently being "
                                            "used by another model."},
                                status=status.HTTP_403_FORBIDDEN)
            return Response({
                "status": "success",
                "message": f"The {self.className} objects have been deleted."
            })


class SpecificMultipleDeleteClassMixin(object):
    id_queryset = None
    className = None
    serializer_class = SpecificMultipleDeleteSerializer
    """
    the child class inheriting this mixin should have the variable `id_queryset` and 'className'
    with the datatype object for 'id_queryset'  i.e. {Model.objects.all()} and
    with the datatype string for 'className' i.e. 'Model Name'
    """

    # serializer = UserSerializer(queryset, many=True)
    # return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        # queryset = self.get_queryset()
        serializer = SpecificMultipleDeleteSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            objects = self.id_queryset.filter(uuid__in=serializer.validated_data.get('uuid'))
            if not objects:
                return Response({"status": "failure", "message": f"Please select valid {self.className}."},
                                status=status.HTTP_404_NOT_FOUND)
            if objects.exclude(assigner=self.request.user).count() >= 1:
                return Response({
                    "status": "failure",
                    "message": f"There are some tasks  that you don't have permission to delete."
                })
            else:
                objects.delete()

            return Response({
                "status": "success",
                "message": f"The {self.className} objects have been deleted."
            })
