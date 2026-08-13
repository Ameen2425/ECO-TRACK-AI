from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from api.models import EmissionRecord
from api.calculator import (
    calculate_co2, get_sustainability_score, get_carbon_classification,
    get_offset_data, calculate_streak, get_risk_indicators
)
from api.ai_engine import get_eco_suggestions, predict_future_emissions

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_emission(request):
    data = request.data
    user = request.user

    total_co2 = calculate_co2(data)

    new_record = EmissionRecord.objects.create(
        user=user,
        transport_km=data.get('transport_km', 0),
        transport_type=data.get('transport_type'),
        electricity_kwh=data.get('electricity_kwh', 0),
        diet_type=data.get('diet_type') or data.get('food_type'),
        gas_usage=data.get('gas_usage', 0),
        waste_kg=data.get('waste_kg', 0),
        total_co2=total_co2,
        vehicle_model=data.get('vehicle_model'),
        fuel_detail=data.get('fuel_detail'),
        vehicle_age_years=data.get('vehicle_age_years', 0),
        age_multiplier=data.get('age_multiplier', 1.0),
        ac_hours=data.get('ac_hours', 0.0),
        house_size=data.get('house_size'),
        geyser_usage=data.get('geyser_usage', 0),
        has_refrigerator=data.get('has_refrigerator', True),
        cooking_fuel=data.get('cooking_fuel'),
        cooking_frequency=data.get('cooking_frequency'),
        waste_type=data.get('waste_type'),
        recycling_habit=data.get('recycling_habit'),
        composting=data.get('composting', False),
        meal_frequency=data.get('meal_frequency'),
        dairy_level=data.get('dairy_level'),
        family_size=data.get('family_size'),
        entry_mode=data.get('entry_mode', 'detailed')
    )

    offset_data = get_offset_data(total_co2)

    return Response({
        "msg": "Record added",
        "total_co2": total_co2,
        "score": get_sustainability_score(total_co2),
        "trees_to_offset": offset_data['trees_to_offset']
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard(request):
    user = request.user
    records = list(EmissionRecord.objects.filter(user=user).order_by('-created_at'))

    if not records:
        return Response({"msg": "No records found", "stats": {}, "suggestions": []}, status=status.HTTP_200_OK)

    latest_record = records[0]
    suggestions = get_eco_suggestions({
        'transport_km': latest_record.transport_km,
        'food_type': latest_record.diet_type,
        'electricity_kwh': latest_record.electricity_kwh,
        'waste_kg': latest_record.waste_kg
    })

    prediction = predict_future_emissions(records)

    total_footprint = sum(r.total_co2 for r in records)
    avg_footprint = total_footprint / len(records)

    classification = get_carbon_classification(latest_record.total_co2)
    offset_data = get_offset_data(latest_record.total_co2)
    streak = calculate_streak(records)
    risks = get_risk_indicators(latest_record)

    return Response({
        "latest": {
            "footprint": latest_record.total_co2,
            "date": latest_record.created_at.isoformat()
        },
        "stats": {
            "total_all_time": round(total_footprint, 2),
            "daily_avg": round(avg_footprint, 2),
            "prediction": prediction
        },
        "intelligence": {
            "classification": classification,
            "offset": offset_data,
            "streak": streak,
            "risks": risks
        },
        "history": [{
            "date": r.created_at.isoformat(),
            "footprint": r.total_co2
        } for r in records[:7]],
        "suggestions": suggestions
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_history(request):
    user = request.user
    records = EmissionRecord.objects.filter(user=user).order_by('-created_at')
    return Response([{
        "id": r.id,
        "total_co2": r.total_co2,
        "transport_km": r.transport_km,
        "transport_type": r.transport_type,
        "electricity_kwh": r.electricity_kwh,
        "diet_type": r.diet_type,
        "gas_usage": r.gas_usage,
        "waste_kg": r.waste_kg,
        "created_at": r.created_at.isoformat()
    } for r in records], status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_emission(request, record_id):
    user = request.user
    try:
        record = EmissionRecord.objects.get(id=record_id, user=user)
    except EmissionRecord.DoesNotExist:
        return Response({"msg": "Record not found"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    record.transport_km = data.get('transport_km', record.transport_km)
    record.transport_type = data.get('transport_type', record.transport_type)
    record.electricity_kwh = data.get('electricity_kwh', record.electricity_kwh)
    record.diet_type = data.get('diet_type', record.diet_type)
    record.gas_usage = data.get('gas_usage', record.gas_usage)
    record.waste_kg = data.get('waste_kg', record.waste_kg)

    record.total_co2 = calculate_co2(data)
    record.save()

    return Response({"msg": "Record updated", "total_co2": record.total_co2}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_emission(request, record_id):
    user = request.user
    try:
        record = EmissionRecord.objects.get(id=record_id, user=user)
    except EmissionRecord.DoesNotExist:
        return Response({"msg": "Record not found"}, status=status.HTTP_404_NOT_FOUND)

    record.delete()
    return Response({"msg": "Record deleted"}, status=status.HTTP_200_OK)
