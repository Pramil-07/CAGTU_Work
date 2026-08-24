# models.py
from django.db import models
from django.utils import timezone
from django.conf import settings
from django.utils.text import slugify




class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(null=True , blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            i = 1
            while BlogPost.objects.filter(slug=base_slug).exists():
                slug = f"{base_slug}-{i}"
                i += 1
            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class BlogPost(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.ForeignKey("productapp.Category", on_delete=models.SET_NULL, null=True, blank=True , related_name='blog')
    tags = models.ManyToManyField("blogapp.Tag", related_name='blog_posts', blank=True)
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    content = models.TextField()
    image = models.ImageField(upload_to="blog_images/", blank=True, null=True)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            i = 1
            while BlogPost.objects.filter(slug=base_slug).exists():
                slug =f"{base_slug}-{i}"
                i += 1
            self.slug = slug
        if self.is_published and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)
