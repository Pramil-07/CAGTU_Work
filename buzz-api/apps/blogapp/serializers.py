# serializers.py
from rest_framework import serializers
from apps.blogapp.models import BlogPost
from .models import  Tag

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']

class BlogPostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = BlogPost
        fields = '__all__'

class BlogPostCreateUpdateSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)
    class Meta:
        model = BlogPost
        exclude = ['author', 'slug', 'published_at', 'created_at', 'updated_at']

    def create(self, validated_data):
        tags_data = validated_data.pop('tags',[])
        blog_post = BlogPost.objects.create(**validated_data)
        for tag_name in tags_data:
            tag_obj,_ = Tag.objects.get_or_create(name=tag_name, slug=tag_name.lower().replace(" ", "-"))
            blog_post.tags.add(tag_obj)
        return blog_post

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags',None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tags_data is not None:
            instance.tags.clear()
            for tag_name in tags_data:
                tag_obj,_ = Tag.objects.get_or_create(name=tag_name, slug=tag_name.lower().replace(" ", "-"))
                instance.tags.add(tag_obj)
        return instance



