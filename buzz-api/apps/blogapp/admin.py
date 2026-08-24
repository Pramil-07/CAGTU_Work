from django.contrib import admin
from .models import  BlogPost , Tag
from .views import BlogPostListAPIView

class BlogPostAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "author",
        "category",
        "is_published",
        "published_at",
        "created_at",
    )
    list_filter = ("is_published", "category", "created_at")
    search_fields = ("title", "content", "author__username")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at", "published_at")
    ordering = ("-created_at",)


admin.site.register(BlogPost, BlogPostAdmin)

class TagAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)

admin.site.register(Tag, TagAdmin)
