import pandas as pd
import uuid
import random
from faker import Faker
from datetime import datetime

# Initialize Faker for generating realistic data
fake = Faker()

# Sample domains for emails
domains = ['cagtu.com', 'acevedo.info', 'conley.com', 'jordan.com', 'miller.biz', 'lester.net', 'williams.net']

# Sample passwords (in real scenarios, these would be hashed later)
passwords = ['p@55w0rd', '!7jX9EWcE@', '!q3Urc5Hb7', '*e1M1CgkG0', '^1Q)u8Ox&p']

def generate_user_data(num_users=2000):
    data = {
        'id': [str(uuid.uuid4()) for _ in range(num_users)],
        'username': [],
        'first_name': [],
        'middle_name': [],
        'last_name': [],
        'email': [],
        'phone': [],
        'password': [],
        'is_active': [],
        'is_superuser': [],
        'is_email_verified': []
    }

    for _ in range(num_users):
        first_name = fake.first_name()
        last_name = fake.last_name()
        middle_name = random.choice([fake.first_name(), None]) if random.random() < 0.3 else None
        
        # Generate username
        username = f"{first_name.lower()}_{last_name.lower()}"
        # Ensure uniqueness by adding a number if needed
        base_username = username
        counter = 1
        while username in data['username']:
            username = f"{base_username}{counter}"
            counter += 1
        
        data['username'].append(username)
        data['first_name'].append(first_name)
        data['middle_name'].append(middle_name)
        data['last_name'].append(last_name)
        data['email'].append(f"{username}@{random.choice(domains)}")
        phone = fake.phone_number() if random.random() < 0.7 else None
        data['phone'].append(phone)
        data['password'].append(random.choice(passwords))
        data['is_active'].append(random.choice([True, False]))
        data['is_superuser'].append(random.choice([True, False]) if random.random() < 0.1 else False)
        data['is_email_verified'].append(random.choice([True, False]))

    return pd.DataFrame(data)

# Generate the data
df = generate_user_data(2000)

# Save to Excel
output_file = 'users_2.xlsx'
df.to_excel(output_file, index=False, engine='openpyxl')

print(f"Generated {len(df)} user records and saved to {output_file}")