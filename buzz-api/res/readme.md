# Bulk Data Upload Documentation

## Overview
This document provides detailed instructions on how to bulk upload various types of data into the Django database. The data can be imported from Excel or CSV files using Django management commands. The available bulk upload commands include:

- **Languages, Currencies, and Countries** (Excel format)
- **Cities** (CSV format)
- **Categories** (CSV format)

## 1. Uploading Languages, Currencies, and Countries
### src="res/country_updated.xlsx"
### Command Usage
To upload data, execute the following command in the terminal:

python manage.py create_country <excel_file_location>


- `<excel_file_location>`: The absolute or relative path to the Excel file (.xlsx) containing the data.

### File Requirements
- **File format**: `.xlsx`
- **File path example**: `E:\path\to\file.xlsx`
- The Excel file must contain three sheets with specific column structures.

### Excel Sheet Structure
#### 1. Sheet Name: `languages`
| Column Name | Description |
|------------|------------|
| `code` | Language code (e.g., "en" for English) |
| `name` | Language name (e.g., "English") |

#### 2. Sheet Name: `currencies`
| Column Name | Description |
|------------|------------|
| `code` | Currency code (e.g., "USD" for US Dollar) |
| `name` | Currency name (e.g., "US Dollar") |
| `minor` | Minor unit (e.g., 100 for cents in a dollar) |
| `symbol` | Currency symbol (e.g., "$") |
| `supports_stripe` | Boolean (TRUE/FALSE) |
| `current_value` | Exchange rate (e.g., 1 for USD) |
| `is_active` | Boolean (TRUE/FALSE) |

#### 3. Sheet Name: `countries`
| Column Name | Description |
|------------|------------|
| `name` | Country name (e.g., "United States") |
| `local_name` | Localized name (e.g., "Estados Unidos") |
| `phone_code` | Country phone code (e.g., "+1") |
| `code` | Country code (e.g., "US") |
| `language_code` | Matches `languages.code` |
| `currency_code` | Matches `currencies.code` |
| `is_active` | Boolean (TRUE/FALSE) |

### Validation and Processing
- The script verifies the file path, sheet names, and column names.
- It checks if the `language_code` and `currency_code` exist before inserting country data.
- If any validation fails, the file is not processed.

## 2. Uploading Cities Data
### src="res/cities_updated_long.csv"
### Command Usage
python3 manage.py create_cities <csv_file_location>
- `<csv_file_location>`: The absolute or relative path to the CSV file.

### File Requirements
- **File format**: `.csv`
- **File path example**: `E:\path\to\file.csv`

### CSV Structure
| Column Name | Description |
|------------|------------|
| `name` | City name (e.g., "New York") |
| `local_name` | Localized city name (e.g., "Nueva York") |
| `country` | Country code (must exist in the database, e.g., "US") |
| `zip_code` | Postal code (e.g., "10001") |
| `latitude` | Decimal format latitude (e.g., "40.7128") |
| `longitude` | Decimal format longitude (e.g., "-74.0060") |

### Processing Steps
- The script checks the existence of the `country` field in the database.
- Latitude and longitude values must be in decimal format.
- If an error occurs (e.g., missing columns or invalid country codes), the file will not be processed.

## 3. Bulk Category Upload
### src="res/task_categories.csv"
### Command Usage
python manage.py create_category <excel_file_location>
- `<csv_file_location>`: The absolute or relative path to the CSV file containing category data.

### Required Fields in CSV File
| Column Name | Description |
|-------------|------------|
| `name` | Category name |
| `parent_name` | Name of the parent category (if applicable) |
| `level` | Hierarchical level of the category |
| `slug` | URL-friendly version of the category name |
| `is_active` | Boolean (TRUE/FALSE) |
| `media_limit` | Limit for media files associated with this category |

### Example CSV Format
```csv
id,name,parent_name,level,slug,is_active,media_limit
1,Electronics,,1,electronics,TRUE,10
2,Mobile Phones,Electronics,2,mobile-phones,TRUE,5
3,Laptops,Electronics,2,laptops,TRUE,8
```

### Implementation Details
- The script verifies the file format and required columns.
- It ensures that parent categories exist before assigning child categories.
- Categories are either created or updated in the database.
- If an error occurs (e.g., missing fields or incorrect data), the script displays an error message.

### Expected Output
If successful:
```
Created category: Electronics
Created category: Mobile Phones
Created category: Laptops
```
If an error occurs:
```
Error creating category Mobile Phones: Field 'level' must be an integer.
```

## Error Handling
- If required columns are missing, an error message lists them.
- If the file path is incorrect, a `CommandError` is displayed.
- Data validation errors will provide detailed error messages.

## Conclusion
This documentation provides a comprehensive guide for bulk data uploads in Django. Ensure files adhere to the specified formats for seamless execution.




#  Bulk Product Upload via CSV
## src="res/products.csv"
##  Overview
This script allows bulk uploading of product data from a CSV file into the Django application. It validates data before processing and ensures that required fields are correctly formatted.

##  Command Usage

python manage.py product_upload <csv_file_location>


###  Required Fields in CSV File

| Column Name           | Description                                               |
|----------------------|-----------------------------------------------------------|
| `Sn`                | Serial number (Unique identifier for each row)             |
| `user_id`           | ID of the user who owns the product                         |
| `SKU`               | Stock Keeping Unit (Must be unique)                         |
| `name`              | Product name                                               |
| `product_status`    | Status of the product (e.g., Active, Inactive)             |
| `description`       | Detailed description of the product                        |
| `slug`              | URL-friendly version of the product name                   |
| `price`             | Selling price of the product                               |
| `stock_quantity`    | Available stock count                                      |
| `cost_price`        | Cost price of the product                                  |
| `local_currency_code` | Currency code (e.g., USD, NPR)                          |
| `discount_per`      | Discount percentage (if applicable)                        |
| `rating`            | Average product rating                                     |
<!-- | `category_name`     | Name of the category the product belongs to               | -->
| `images`           | Comma-separated list of image file names                    |
| `is_active`         | Boolean (TRUE/FALSE) indicating if the product is active 
| 'shop'               | Shop ID Should be given 




### Example CSV Format

Sn,user_id,SKU,name,product_status,description,slug,price,stock_quantity,cost_price,local_currency_code,discount_per,rating,category_name,images,is_active,shop
1,101,SKU-001,Smartphone,Active,"Latest 5G smartphone","smartphone-5g",699,50,500,USD,10,4.5,Mobile Phones,"image1.jpg,image2.jpg",TRUE,526c5165-4fef-47dd-9ee3-5fd33a1c8d88
2,102,SKU-002,Laptop,Active,"High-performance laptop","laptop-pro",1200,30,900,USD,15,4.7,Laptops,"laptop1.jpg,laptop2.jpg",TRUE,526c5165-4fef-47dd-9ee3-5fd33a1c8d88
3,103,SKU-003,Smartwatch,Inactive,"Waterproof smartwatch","smartwatch-x",199,100,150,USD,5,4.2,Electronics,"watch1.jpg,watch2.jpg",FALSE

### Implementation Details
- The script verifies the file format and ensures all required columns are present in the CSV file.
- It checks if the `user_id` exists in the database before creating a product.
- The `SKU` field must be unique; if a duplicate is found, the script skips the entry.
- The `local_currency_code` is validated against existing currency records; if missing, it defaults to "NPR".
- The `images` field should contain a comma-separated list of image URLs; the script splits and assigns them accordingly.
- If the Shop is abvailable assign that product to shop if not not shop will be none to that product  and product owner will be the user
- If an error occurs (e.g., missing fields, duplicate SKU, invalid foreign key references), the script logs the error and skips the affected entry.
- Checks for valid user_id and shop references in the database.
- Ensures SKU uniqueness to prevent duplicates.
- Assigns products to a shop's category if a shop is provided; otherwise, sets category to None.
- Prioritizes shop assignment by setting user_id to None when a shop is provided.


### Expected Output
If successful:
```
Created product: Smartphone
Created product: Laptop
Created product: Headphones

```
If an error occurs:
```
Error creating category Mobile Phones: Smartphone
Error creating category Mobile Phones: Laptop

```


## Error Handling
- If required columns are missing, an error message lists them.
- If the file path is incorrect, a `CommandError` is displayed.
- Data validation errors will provide detailed error messages.

## Conclusion
This documentation provides a comprehensive guide for bulk data uploads in Django. Ensure files adhere to the specified formats for seamless execution.



## 4. Create A random user 
### command python  manage.py create_random_users no_of_user such as python  manage.py create_random_users 50



# 5. Create a User with CSV or Xlsxx File
### Info  sheet 1 name = User and Sheet 2 name = Profiles
## src="res/user_profile_data.xlsx"
## Bulk User Upload
##  Overview
This script allows bulk uploading of User data from a CSV file into the Django application. It validates data before processing and ensures that required fields are correctly formatted.
### Command Usage

python manage.py user_upload path/to/excel.xlsx --user-sheet Users --profile-sheet Profiles
### Info
Create User data and also create the profile data 


### Required Fields in CSV File

| Column Name       | Description                                             |
|-------------------|---------------------------------------------------------|
| `id`              | Unique user ID (UUID)                                   |
| `username`        | Username (must be unique)                               |
| `first_name`      | First name of the user                                  |
| `last_name`       | Last name of the user                                   |
| `email`           | Email address (must be unique)                          |
| `phone`           | User's phone number (optional)                          |
| `password`        | User's password (if not provided, a default password is used) |
| `is_active`       | Boolean (TRUE/FALSE) - Indicates whether the user is active |
| `is_superuser`    | Boolean (TRUE/FALSE) - Indicates if the user has admin privileges |
| `is_email_verified` | Boolean (TRUE/FALSE) - Indicates if the user's email is verified |

### Example CSV Format

id,username,first_name,last_name,email,phone,password,is_active,is_superuser,is_email_verified
1,john_doe,John,Doe,john.doe@example.com,+1234567890,password123,TRUE,FALSE,TRUE
2,jane_smith,Jane,Smith,jane.smith@example.com,+0987654321,password456,TRUE,TRUE,TRUE
3,alex_jones,Alex,Jones,alex.jones@example.com,+1122334455,password789,FALSE,FALSE,FALSE



## Conclusion
This documentation provides a comprehensive guide for bulk user data uploads in Django. Ensure that your file adheres to the specified formats and contains all required columns to ensure a smooth execution process. Following the guidelines will allow for seamless user data import and validation during the bulk upload process.


## Error Handling
- If required columns are missing, an error message will list them (e.g., `Missing required columns: ['id', 'username', 'email']`).
- If the file path is incorrect, a `FileNotFoundError` or `CommandError` will be displayed.
- Data validation errors (such as invalid email or phone number format) will provide detailed error messages (e.g., `Error: Invalid email format for user john_doe`).

## Conclusion
This documentation provides a comprehensive guide for bulk user data uploads in Django. Ensure that your file adheres to the specified formats and contains all required columns to ensure a smooth execution process. Following the guidelines will allow for seamless user data import and validation during the bulk upload process.



#  6.  Bulk Merchant Prodile Upload via CSV
##  Overview
This script allows bulk uploading of Merchant data from a CSV file into the Django application. It validates data before processing and ensures that required fields are correctly formatted.
## src="res/merchant_upload.csv"

##  Command Usage

python manage.py merchant_upload <csv_file_location>

###  Required Fields in CSV File
| Column Name             | Description                                                  |
|------------------------|--------------------------------------------------------------|
| `first_name`          | First name of the merchant user                              |
| `middle_name`         | Middle name of the merchant user (Optional)                 |
| `last_name`           | Last name of the merchant user                               |
| `merchant_name`       | Name of the merchant organization                           |
| `merchant_description` | Detailed description of the merchant's services            |
| `merchant_email`      | Email address of the merchant                               |
| `office_contact_number` | Contact phone number of the merchant                     |
| `city`               | City where the merchant is located                          |
| `country`            | Country where the merchant is located                       |
| `commission`         | Commission percentage for the merchant (0.0-0.5)            |
| `currency`           | Currency code used by the merchant (e.g., USD, AFN)         |
| `address_line_1`     | Primary address line of the merchant                        |
| `address_line_2`     | Secondary address line of the merchant (Optional)          |
| `logo`              | URL to the merchant's logo image (Optional)                  |
| `opens_at`          | Opening time of the merchant (HH:MM:SS format)              |
| `closes_at`         | Closing time of the merchant (HH:MM:SS format)              |
| `active_days`       | Comma-separated list of days the merchant is active         |
| `categories`        | Category name of the merchant's business                     |


### Example CSV Format

Dawn	Jennifer	Joseph	Mullen, Sanders and Snyder	Enhanced national database	rmartin@cruz-hernandez.net	280-694-8825	Jitpur	Afghanistan	0.1	AFN	246 Pamela Parkways Suite 420	Suite 040	https://placeimg.com/65/1013/any	00:46:20	21:10:09	Tuesday, Wednesday, Saturday, Sunday, Friday	Agriculture and Environment
Raymond		Friedman	Stone-Gilbert	Re-contextualized coherent strategy	yanderson@hotmail.com	-10118	Ghorahi	Aland Islands	0.3	EUR	159 Samantha Knolls	Apt. 007	https://dummyimage.com/928x115	01:52:35	20:17:49	Thursday, Tuesday, Wednesday, Monday, Friday	Beauty and Cosmetics

### Implementation Details
- The script verifies the file format and ensures all required columns are present in the CSV file.
- It validate the phone got from the csv
- It validate the Email got from the csv
- It validate the opens_at and close_at got from the csv
- It tried to get the  a User based on first_name, last_name, and email
- It tried to get the  a User based on first_name, last_name, (if not email provided )
- If User is not found based on the given data then New User is created with 
- following data username,first_name,last_name,email or {username}@gmail.com,password as "homaale-user",is_active=True,
-  If the mulitple user found with same full name and last name then treid to mathcn condition email if all not conduitino match then create a new user same as above
- other category is get according to name passed as cateogry in csv ,
- currency is get according to code passed as currency in csv
- city is get according to name passed as city in csv 
- country is get according to name passed as country in csv 
- Skip condtion if merchant already exists for this user



# 7.  Bulk FAQ TOPIC Initalize  Upload via CSV
##  Overview
This script allows bulk uploading of FAQTopic data from a Json file into the Django application. It validates data before processing and ensures that required fields are correctly formatted.
## src="res\initialize\FAQTOPIC.json"

##  Command Usage

python manage.py load_faq_topics 

###  Required Fields in CSV File

### Implementation Details
- The script verifies the file format and ensures all required columns are present in the json file.
- If Any Changes or content need to add in FAQ topic just update this file  located in the res\initialize\FAQTOPIC.json
- Run the command  python manage.py load_faq_topics  then new topics is entry on database

