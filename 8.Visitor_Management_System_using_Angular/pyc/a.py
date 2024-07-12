import json
import random
from faker import Faker
from datetime import datetime, timedelta

fake = Faker('en_IN')  # For Indian locale

def random_phone():
    return fake.unique.msisdn()[:10]

def random_aadhar():
    return '{} {} {}'.format(fake.unique.random_number(digits=4, fix_len=True),
                             fake.unique.random_number(digits=4, fix_len=True),
                             fake.unique.random_number(digits=4, fix_len=True))

def random_date(start_date):
    intime = start_date + timedelta(days=random.randint(1, 30))
    outtime = intime + timedelta(days=random.randint(1, 30))
    return intime, outtime

start_date = datetime.strptime("2024-03-01", "%Y-%m-%d")

tamilnadu_names = [
    "Arun", "Balaji", "Chandran", "Deepak", "Elango", "Feroz", "Gopi", "Hari", "Indrajit",
    "Jagan", "Karthik", "Lalith", "Madhan", "Naveen", "Omprakash", "Pradeep", "Rajan", 
    "Sandeep", "Tharun", "Uday", "Vikram", "Yogesh", "Zakir"
]

random.shuffle(tamilnadu_names)  # Shuffle to get random unique names

records = []

used_ids = set()

while len(records) < 50:
    _id = random.randint(1, 300)
    if _id in used_ids:
        continue
    used_ids.add(_id)
    
    username = tamilnadu_names[len(records) % len(tamilnadu_names)]
    phone = random_phone()
    aadhar = random_aadhar()
    intime, outtime = random_date(start_date)
    
    record = {
        "_id": _id,
        "username": username,
        "phone": phone,
        "aadhar": aadhar,
        "intime": intime.isoformat(),
        "outtime": outtime.isoformat()
    }
    records.append(record)

with open("records.json", "w") as f:
    json.dump(records, f, indent=4)

print("Records have been written to records.json")
