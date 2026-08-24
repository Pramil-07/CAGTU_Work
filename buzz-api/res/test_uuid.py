import uuid
import random

# Provided UUIDs
fixed_uuids = [
    "71d29986-585c-4abc-a42b-89099b8567cf",
    "d9cf5c23-0b77-46e2-9bbc-804882298ca9",
    "cf106c10-6285-49de-a38a-8fb65b8e72f4"
]

# Total number of UUIDs to generate
TOTAL_UUIDS = 150
RANDOM_UUID_COUNT = 3  # Number of random UUIDs
FIXED_UUID_COUNT = TOTAL_UUIDS - RANDOM_UUID_COUNT  # Number of UUIDs from fixed set

# Generate the list
uuid_list = []

# Add 147 UUIDs randomly selected from the fixed_uuids
for _ in range(FIXED_UUID_COUNT):
    uuid_list.append(random.choice(fixed_uuids))

# Add 3 random UUIDs
for _ in range(RANDOM_UUID_COUNT):
    uuid_list.append(str(uuid.uuid4()))

# Shuffle the list to mix fixed and random UUIDs
random.shuffle(uuid_list)

# Print the list
print("List of 150 UUIDs:")
for i, uid in enumerate(uuid_list, 1):
    print(f"{uid}")

# Verify counts (optional)
fixed_count = sum(1 for uid in uuid_list if uid in fixed_uuids)
random_count = TOTAL_UUIDS - fixed_count
print(f"\nVerification:")
print(f"Count of fixed UUIDs: {fixed_count}")
print(f"Count of random UUIDs: {random_count}")