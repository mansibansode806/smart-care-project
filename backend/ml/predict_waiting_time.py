import sys
import joblib
import pandas as pd

# Load trained model
model = joblib.load("ml/waiting_time_model.pkl")

# Read values from Node.js
queue_count = int(sys.argv[1])
priority = sys.argv[2]
avg_consultation_minutes = int(sys.argv[3])
time_of_day = sys.argv[4]

# Create input data
input_data = pd.DataFrame([
    {
        "queue_count": queue_count,
        "priority": priority,
        "avg_consultation_minutes": avg_consultation_minutes,
        "time_of_day": time_of_day,
    }
])

# Predict waiting time
prediction = model.predict(input_data)

# Print only the prediction
print(round(prediction[0]))