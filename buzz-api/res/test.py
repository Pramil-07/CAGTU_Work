import pandas as pd
cities_path = open(r'') # Path to the cities.csv file
lat_long_path = open(r'') # Path to the lat_long.csv file


lat_long_df = pd.read_csv(lat_long_path)
cities_df = pd.read_csv(cities_path)

# Display the first few rows of both dataframes for inspection
lat_long_df.head(), cities_df.head()
print(lat_long_df.head(), cities_df.head())


# Rename and rearrange columns in lat_long_df to match cities_df
lat_long_df.columns = ['index', 'zip_code', 'name', 'latitude', 'longitude']

# Drop the extra 'index' column from lat_long_df
lat_long_df = lat_long_df.drop(columns=['index'])

# Add the 'local_name' and 'country' columns to lat_long_df
lat_long_df['local_name'] = lat_long_df['name']  # Using the same value as 'name'
lat_long_df['country'] = 'NP'  # Assuming Nepal (as seen in cities.csv structure)

# Rearrange columns to match cities_df exactly
lat_long_df = lat_long_df[['name', 'local_name', 'country', 'zip_code', 'latitude', 'longitude']]

# Save the updated DataFrame as cities_updated.csv
updated_csv_path = 'res\cities_updated_long.csv'
lat_long_df.to_csv(updated_csv_path, index=False)

# Return the first few rows of the updated DataFrame for confirmation
lat_long_df.head(), updated_csv_path
