# apps/analyticsapp/management/commands/seed_metrics.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accountapp.models import User
from apps.productapp.models import Product, Stock
from apps.checkoutapp.models import Order, OrderItem
from apps.analyticsapp.models import ProductView
from random import randint, choice

class Command(BaseCommand):
    help = "Seed analytics metrics data"

    def handle(self, *args, **options):
        self.stdout.write("Seeding analytics metrics data...")

        # --- Create Users ---
        users_data = [
            ("alice", "alice@example.com", "alice123"),
            ("bob", "bob@example.com", "bob123"),
            ("carol", "carol@example.com", "carol123"),
        ]

        users = {}
        for username, email, password in users_data:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                user = User(username=username, email=email)
                user.set_password(password)
                user.save()
            users[username] = user

        # --- Create Products ---
        products_data = [
            ("Laptop", 1000),
            ("Phone", 500),
            ("Headphones", 150),
        ]

        products = {}
        for name, price in products_data:
            product, _ = Product.objects.get_or_create(
                name=name,
                defaults={"user": users["alice"], "product_status": "active", "category_id": 1}
            )
            products[name] = product

        # --- Create Stocks ---
        stock_data = [
            ("Laptop", 10),
            ("Phone", 3),  # low stock
            ("Headphones", 20),
        ]

        stocks = {}
        for prod_name, qty in stock_data:
            product = products[prod_name]
            stock, _ = Stock.objects.get_or_create(
                product=product,
                defaults={
                    "slug": f"{product.slug}-default",
                    "mrp": randint(100, 2000),
                    "price": randint(50, 1500),
                    "sku": f"SKU-{randint(1000,9999)}",
                    "color": "Black",
                    "availability": True,
                    "size_unit": "unit",
                    "size": 1,
                    "quantity": qty,
                    "is_default": True,
                }
            )
            stocks[prod_name] = stock

        # --- Create Orders and OrderItems ---
        order1 = Order.objects.create(user=users["alice"], total_price=2500, order_status="completed")
        OrderItem.objects.create(
            user=users["alice"],
            stock=stocks["Laptop"],
            product_name=stocks["Laptop"].product.name,
            product_id=str(stocks["Laptop"].product.id),
            product_price=int(stocks["Laptop"].price),
            quantity=2,
            sub_total=int(stocks["Laptop"].price) * 2,
            order_status="completed"
        )
        OrderItem.objects.create(
            user=users["alice"],
            stock=stocks["Phone"],
            product_name=stocks["Phone"].product.name,
            product_id=str(stocks["Phone"].product.id),
            product_price=int(stocks["Phone"].price),
            quantity=1,
            sub_total=int(stocks["Phone"].price) * 1,
            order_status="completed"
        )

        order2 = Order.objects.create(user=users["bob"], total_price=500, order_status="completed")
        OrderItem.objects.create(
            user=users["bob"],
            stock=stocks["Phone"],
            product_name=stocks["Phone"].product.name,
            product_id=str(stocks["Phone"].product.id),
            product_price=int(stocks["Phone"].price),
            quantity=1,
            sub_total=int(stocks["Phone"].price),
            order_status="completed"
        )

        order3 = Order.objects.create(user=users["alice"], total_price=600, order_status="completed")
        OrderItem.objects.create(
            user=users["alice"],
            stock=stocks["Headphones"],
            product_name=stocks["Headphones"].product.name,
            product_id=str(stocks["Headphones"].product.id),
            product_price=int(stocks["Headphones"].price),
            quantity=3,
            sub_total=int(stocks["Headphones"].price) * 3,
            order_status="completed"
        )

        # --- Attach OrderItems to Orders ---
        order1.order_items.add(
            *OrderItem.objects.filter(user=users["alice"], stock__in=[stocks["Laptop"], stocks["Phone"]]))
        order2.order_items.add(*OrderItem.objects.filter(user=users["bob"], stock=stocks["Phone"]))
        order3.order_items.add(*OrderItem.objects.filter(user=users["alice"], stock=stocks["Headphones"]))

        # --- Add Product Views ---
        for prod_name in ["Laptop", "Phone", "Headphones"]:
            product = products[prod_name]
            for user in users.values():
                ProductView.objects.create(product=product, user=user)

        self.stdout.write(self.style.SUCCESS("Seeding complete!"))
