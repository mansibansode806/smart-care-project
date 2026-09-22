import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

# Load training data
data = pd.read_csv("ml/waiting_time_data.csv")

# Input features
X = data[
    [
        "queue_count",
        "priority",
        "avg_consultation_minutes",
        "time_of_day",
    ]
]

# Target
y = data["actual_waiting_minutes"]

# Categorical columns
categorical_features = ["priority", "time_of_day"]

# Preprocessing
preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features,
        )
    ],
    remainder="passthrough",
)

# Random Forest model
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

# Complete ML pipeline
pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model),
    ]
)

# Train model
pipeline.fit(X, y)

# Save trained model
joblib.dump(pipeline, "ml/waiting_time_model.pkl")

print("Waiting time Random Forest model trained successfully!")
print("Model saved as: ml/waiting_time_model.pkl")