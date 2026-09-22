import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

# Training data
data = pd.read_csv("ml/bed_demand_data.csv")

X = data[["hospital_id", "day_of_week"]]
y = data["icu_demand"]

model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

model.fit(X, y)

joblib.dump(model, "ml/bed_demand_model.pkl")

print("Bed/ICU demand model trained successfully!")