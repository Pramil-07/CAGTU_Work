# urls.py

from django.urls import path
from .views import (
    BlogPostListAPIView,
    BlogPostDetailAPIView,
    BlogPostCreateAPIView,
    BlogPostUpdateAPIView,
    BlogPostDeleteAPIView, TagListCreateView,TagDetailView
)
from .views import  BlogPostsByTagView , TrendingBlogListAPIView
urlpatterns = [

    path('tags/', BlogPostsByTagView.as_view(), name='blog-by-tag'),

    path("trending/", TrendingBlogListAPIView.as_view(), name="trending-blogs"),
    path('create/', BlogPostCreateAPIView.as_view()),
    path('<slug:slug>/update/', BlogPostUpdateAPIView.as_view()),
    path('<slug:slug>/delete/', BlogPostDeleteAPIView.as_view()),
    path('<slug:slug>/', BlogPostDetailAPIView.as_view()),
    path('', BlogPostListAPIView.as_view()),
]
