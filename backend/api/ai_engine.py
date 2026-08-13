import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np

def get_eco_suggestions(data):
    suggestions = []
    
    if data.get('transport_km', 0) > 20:
        suggestions.append("Try using public transport or carpooling for your long commutes.")
    
    food_val = data.get('food_type') or data.get('diet_type')
    if food_val in ['non_veg', 'Non-Vegetarian']:
        suggestions.append("Consider having a 'Meatless Monday' to reduce your food footprint.")
    
    if data.get('electricity_kwh', 0) > 10:
        suggestions.append("Switch off idle appliances and consider LED bulbs to save energy.")
        
    if data.get('waste_kg', 0) > 2:
        suggestions.append("Start composting organic waste to reduce methane emissions from landfills.")

    if not suggestions:
        suggestions.append("You're doing great! Keep maintaining your sustainable habits.")
        
    return suggestions

def predict_future_emissions(user_records):
    if len(user_records) < 5:
        return "Insufficient data for prediction. Keep logging daily!"
    
    df = pd.DataFrame([{
        'date': r.created_at,
        'footprint': r.total_co2
    } for r in user_records])
    
    df['date_ordinal'] = pd.to_datetime(df['date']).map(pd.Timestamp.toordinal)
    
    X = df['date_ordinal'].values.reshape(-1, 1)
    y = df['footprint'].values
    
    model = LinearRegression()
    model.fit(X, y)
    
    future_date = (pd.to_datetime(df['date'].max()) + pd.Timedelta(days=30)).toordinal()
    prediction = model.predict([[future_date]])
    
    return round(float(prediction[0]), 2)
