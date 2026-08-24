from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Tag
from apps.blogapp.models import BlogPost
from apps.core.cache import CustomCache


# BlogPost cache invalidation
@receiver(post_save, sender=BlogPost)
@receiver(post_delete, sender=BlogPost)
def invalidate_blog_cache(sender, instance, **kwargs):
    # Clear detail cache
    CustomCache.delete(f"blog:detail:{instance.slug}")

    # Clear trending cache
    CustomCache.delete("blog:trending:*")
    print(f"Blog deleted: {instance.slug}")
    CustomCache.delete('blog:list:*')


    # Clear tag-based caches
    for tag in instance.tags.all():
        CustomCache.delete(f"blog:tag:{tag.slug}")


@receiver(post_save, sender=Tag)
@receiver(post_delete, sender=Tag)
def invalidate_tag_cache(sender, instance, **kwargs):
    print(f"Tag deleted: {instance.slug}")
    CustomCache.delete("tag:list:*")