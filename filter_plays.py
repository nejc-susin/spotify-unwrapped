import json
from datetime import datetime

# Read the JSON file
input_file = 'assets/data/Clean_Streaming_History_2020-2023.json'
start_date = datetime.fromisoformat('2022-06-15T16:30:00+00:00')
end_date = datetime.fromisoformat('2022-06-16T00:00:00+00:00')

def parse_timestamp(ts):
    # Remove the 'Z' and add '+00:00' for UTC
    if ts.endswith('Z'):
        ts = ts[:-1] + '+00:00'
    return datetime.fromisoformat(ts)

# Read the original data
with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Filter out plays between the specified timestamps
filtered_data = [
    play for play in data
    if not (start_date <= parse_timestamp(play['ts']) < end_date)
]

# Write the filtered data back to the file
with open(input_file, 'w', encoding='utf-8') as f:
    json.dump(filtered_data, f, indent=2)

print(f"Original number of plays: {len(data)}")
print(f"Number of plays after filtering: {len(filtered_data)}")
print(f"Removed {len(data) - len(filtered_data)} plays") 