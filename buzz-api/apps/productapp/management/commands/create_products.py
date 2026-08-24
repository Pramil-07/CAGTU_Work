import pandas as pd
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.productapp.models import Product, Category, Brand, Tag

User = get_user_model()

class Command(BaseCommand):
    help = "Create multiple products from an Excel file"

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            type=str,
            help="Path to the Excel file containing products",
        )

    def handle(self, *args, **kwargs):
        file_path = kwargs.get("file")
        if not file_path:
            self.stdout.write(self.style.ERROR("Please provide an Excel file path using --file"))
            return

        # Read Excel file
        df = pd.read_excel(file_path)

        created_products = []

        for index, row in df.iterrows():
            name = row.get("name")
            product_status = row.get("product_status", "General")
            category_id = row.get("category_id")
            brand_id = row.get("brand_id")
            added_by = row.get("added_by", "admin")

            # Fetch related objects
            category = Category.objects.filter(id=category_id).first() if category_id else None
            brand = Brand.objects.filter(id=brand_id).first() if brand_id else None
            user = User.objects.filter(username=added_by).first()

            # Create product
            product = Product.objects.create(
                name=name,
                product_status=product_status,
                category=category,
                brand=brand,
                user=user,
                added_by=user.username if user else added_by,
                thumbnail_image=row.get("thumbnail_image", ""),
                video_url=row.get("video_url"),
                description=row.get("description", ""),
            )

            # Handle tags (comma separated)
            tags_str = row.get("tags")  # e.g., "tag1,tag2,tag3"
            if tags_str:
                tags_list = [t.strip() for t in tags_str.split(",")]
                for tag_name in tags_list:
                    tag = Tag.objects.filter(name=tag_name).first()
                    if tag:
                        product.tags.add(tag)

            created_products.append(product.slug)

        self.stdout.write(
            self.style.SUCCESS(f"Successfully created products: {', '.join(created_products)}")
        )
