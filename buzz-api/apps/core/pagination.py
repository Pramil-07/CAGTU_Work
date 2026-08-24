from rest_framework.response import Response
from rest_framework import pagination
from collections import OrderedDict


class CustomPagination(pagination.PageNumberPagination):
    page_size = 15
    page_size_query_param = "page_size"

    def get_paginated_response(self, data):
        return Response(
            OrderedDict(
                [
                    ("total_pages", self.page.paginator.num_pages),
                    ("count", self.page.paginator.count),
                    ("current", self.page.number),
                    ("next", self.get_next_link()),
                    ("previous", self.get_previous_link()),
                    ("page_size", self.get_page_size(self.request)),
                    ("result", data),
                ]
            )
        )
