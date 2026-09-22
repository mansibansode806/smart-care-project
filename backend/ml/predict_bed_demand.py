import sys
import joblib
import pandas as pd

hospital_id = int(sys.argv[1])
day_of_week = int(sys.argv[2])

model = joblib.load("ml/bed_demand_model.pkl")

input_data = pd.DataFrame([
    {
        "hospital_id": hospital_id,
        "day_of_week": day_of_week
    }
])

prediction = model.predict(input_data)[0]

print(round(prediction, 2))