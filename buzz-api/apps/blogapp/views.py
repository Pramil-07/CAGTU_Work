from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404

from cagtubuzz.settings import ALLOWED_HOSTS
from .models import BlogPost
from .serializers import (
    BlogPostSerializer,
    BlogPostCreateUpdateSerializer,
    TagSerializer,
)
from .models import Tag
from django.db.models import Count
from .filters import BlogPostFilter
from django.db.models import Avg, Count

from ..core.cache import CustomCache
from ..core.pagination import CustomPagination


@extend_schema(tags=["blogpost"])
class BlogPostsByTagView(APIView):
    @CustomCache.cache_response(
        "blog:tag:{request.query_params[tag_name]}", timeout=300
    )
    def get(self, request, *args, **kwargs):
        tag_name = request.query_params.get("tag_name")

        if not tag_name:
            return Response({"detail": "tag_name query param required"}, status=400)
        tag = Tag.objects.filter(slug=tag_name).first()
        if not tag:
            return Response({"detail": "tag_name query param not found"}, status=400)
        posts = tag.blog_posts.all()
        serializer = BlogPostSerializer(posts, many=True)
        return Response(serializer.data)


class TagListCreateView(APIView):
    @CustomCache.cache_response("tag:list:*", timeout=300)
    def get(self, request, *args, **kwargs):
        tags = Tag.objects.all()
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        serializer = TagSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TagDetailView(APIView):
    def get_object(self, pk):
        return Tag.objects.filter(pk=pk).first()

    def put(self, request, pk, *args, **kwargs):
        tag = self.get_object(pk)
        if not tag:
            return Response(
                {"detail": "Tag not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = TagSerializer(tag, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk, *args, **kwargs):
        tag = self.get_object(pk)
        if not tag:
            return Response(
                {"detail": "Tag not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = TagSerializer(tag, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, *args, **kwargs):
        tag = self.get_object(pk)
        if not tag:
            return Response(
                {"detail": "Tag not found"}, status=status.HTTP_404_NOT_FOUND
            )

        tag.delete()
        return Response(
            {"detail": "Tag deleted successfully"}, status=status.HTTP_204_NO_CONTENT
        )


@extend_schema(tags=["blogpost"])
class BlogPostListAPIView(APIView):
    filter_backends = [DjangoFilterBackend]
    filterset_class = BlogPostFilter
    pagination_class = CustomPagination
    permission_classes = (AllowAny,)

    @CustomCache.cache_response("blog:list:*", timeout=300)
    def get(self, request, *args, **kwargs):
        queryset = BlogPost.objects.filter(is_published=True)
        print("queryset", queryset)

        filterset = BlogPostFilter(request.GET, queryset=queryset)
        if filterset.is_valid():
            queryset = filterset.qs
        else:
            return Response(filterset.errors, status=400)
        paginator = self.pagination_class()
        paginated_response = paginator.paginate_queryset(queryset, request=request)
        serializer = BlogPostSerializer(
            paginated_response, many=True, context={"request": request}
        )
        return paginator.get_paginated_response(serializer.data)


@extend_schema(tags=["blogpost"])
class BlogPostDetailAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    @CustomCache.cache_response("blog:*", timeout=300)
    def get(self, request, slug, *args, **kwargs):
        post = get_object_or_404(BlogPost, slug=slug, is_published=True)
        serializer = BlogPostSerializer(post, context={"request": request})
        return Response(serializer.data)


@extend_schema(tags=["blogpost"])
class BlogPostCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = BlogPostCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            blog = serializer.save(author=request.user)
            return Response(
                BlogPostSerializer(blog).data, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=["blogpost"])
class BlogPostUpdateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, slug, *args, **kwargs):
        blog = get_object_or_404(BlogPost, slug=slug)
        if blog.author != request.user:
            return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        serializer = BlogPostCreateUpdateSerializer(blog, data=request.data)
        if serializer.is_valid():
            blog = serializer.save()
            return Response(BlogPostSerializer(blog).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=["blogpost"])
class BlogPostDeleteAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, slug, *args, **kwargs):
        blog = get_object_or_404(BlogPost, slug=slug)
        if blog.author != request.user:
            return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        blog.delete()
        return Response({"message": "Deleted"}, status=status.HTTP_204_NO_CONTENT)


@extend_schema(tags=["blogpost"])
class TrendingBlogListAPIView(APIView):
    # @CustomCache.cache_response("blog:trending:*", timeout=300)
    def get(self, request, *args, **kwargs):
        blogs = (
            BlogPost.objects.annotate(
                avg_rating=Avg("reviews__rating"),
                total_ratings=Count("reviews"),
            )
            .filter(is_published=True, total_ratings__gte=1, avg_rating__gte=3)
            .order_by("-avg_rating", "-total_ratings")
        )
        serializer = BlogPostSerializer(blogs, many=True, context={"request": request})
        return Response(serializer.data)
