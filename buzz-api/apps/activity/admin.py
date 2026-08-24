from django.contrib import admin
from django.utils.safestring import mark_safe

from apps.activity.models import Rating, MerchantRating, Activity, RatingImages


class ActivityAdmin(admin.ModelAdmin):
    model = Activity
    list_display = (
        "actor_content_object",
        "action_content_type",
        "action_object_id",
        "action_content_object",
        "action",
    )


admin.site.register(Activity, ActivityAdmin)


class RatingImagesInline(admin.TabularInline):
    model = RatingImages
    fields = (
        "image_display",
        "image",
    )  # Include 'image' for editing, 'image_display' for viewing
    readonly_fields = ("image_display",)
    extra = 1  # Number of empty rows for adding new images

    def image_display(self, obj):
        """Render the image field as an HTML image tag in the inline table."""
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" width="100" height="100" />')
        return "No Image"

    image_display.short_description = "Image Preview"


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "product",
        "rating",
        "blog",
        "review",
    )  # Customize as needed
    inlines = [RatingImagesInline]

from django.contrib import admin
from .models import Reply

class ChildReplyInline(admin.TabularInline):
    """
    Inline display for child replies in parent reply.
    """
    model = Reply
    fk_name = "parent_reply"
    extra = 0
    readonly_fields = ("user", "text", "rating", "created_at")
    can_delete = False


@admin.register(Reply)
class ReplyAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "rating", "parent_reply", "created_at", "depth")
    search_fields = ("user__username", "text", "rating__id")
    list_filter = ("created_at",)
    inlines = [ChildReplyInline]
    readonly_fields = ("get_depth",)

    def depth(self, obj):
        """Show reply depth in list display"""
        return obj.get_depth()
    depth.short_description = "Depth"

admin.site.register(MerchantRating)
admin.site.register(RatingImages)
