

Documentation for creating bulk update of our data to the server in the fresh start or if we have collected data on Excel file

Command for uploading Language , Currency , Country :
Please type this command in command prompt of the server.
    python manage.py create_country <excel_file_location>

File Requirements:
    - File format: .xlsx
    - File path example: E:\path\to\file.xlsx

You should follow the specific Excel sheet structure:
    1. Sheet Name: `languages`
        - Columns:
            - code (e.g., "en" for English)
            - name (e.g., "English")

    2. Sheet Name: `currencies`
        - Columns:
            - code (e.g., "USD" for US Dollar)
            - name (e.g., "US Dollar")
            - minor (e.g., 100 for cents in a dollar)
            - symbol (e.g., "$")
            - supports_stripe (TRUE/FALSE)
            - current_value (e.g., 1 for USD equivalent)
            - is_active (TRUE/FALSE)

    3. Sheet Name: `countries`
        - Columns:
            - name (e.g., "United States")
            - local_name (e.g., "Estados Unidos")
            - phone_code (e.g., "+1")
            - code (e.g., "US")
            - language_code (matches `languages.code`)
            - currency_code (matches `currencies.code`)
            - is_active (TRUE/FALSE)


We have relation between  language , currency and country so please use the sheet name mentioned above and also the columns name should not be difference.
if failed to create even a small error in name file will ot be saved .

How is data stored in our database ?
Activating the command will first check path and then the sheet name and the column name .
after that in the country sheet it checks for name and code of the Language sheet if it cant find the code and name then it will create else it will move to second row also it does same for the currency.




Uploading Cities Data
Command:
    python manage.py create_cities <csv_file_location>

File Requirements:
    - File format: .csv
    - File path example: E:\path\to\file.csv

CSV Structure:
    - Columns:
        1. name: City name (e.g., "New York")
        2. local_name: Local name of the city (e.g., "Nueva York")
        3. country: Country code (must exist in the database, e.g., "US")
        4. zip_code: Postal code (e.g., "10001")
        5. latitude: Latitude (e.g., "40.7128")
        6. longitude: Longitude (e.g., "-74.0060")

Usage:
    1. Prepare a CSV file with the specified structure.
    2. Ensure the `country` column matches existing country codes in the database.
    3. Run the command:
        python manage.py create_cities <file_path>

    4. Script will validate and upload city data to the database.

Note:
    - Country code in the `country` column is mandatory and must exist in the database.
    - Latitude and longitude should be in decimal format.
"""

