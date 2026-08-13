import calendar
import datetime
from collections import defaultdict
from django.db.models import Avg, Count
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from api.models import EmissionRecord, User

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_analytics(request):
    user = request.user
    records = list(EmissionRecord.objects.filter(user=user).order_by('created_at'))

    breakdown = {
        "transport": round(sum(r.total_co2 for r in records if r.transport_km > 0), 2),
        "energy": round(sum(r.total_co2 for r in records if (r.electricity_kwh > 0 or r.gas_usage > 0)), 2),
        "diet": round(sum(r.total_co2 for r in records if r.diet_type is not None), 2),
        "waste": round(sum(r.total_co2 for r in records if r.waste_kg > 0), 2)
    }

    return Response({
        "category_breakdown": breakdown,
        "comparison_data": [{
            "date": r.created_at.strftime("%Y-%m-%d"),
            "user": r.total_co2
        } for r in records[-30:]]
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_heatmap(request):
    user = request.user
    today = timezone.now().date()
    start_of_month = datetime.datetime(today.year, today.month, 1, tzinfo=datetime.timezone.utc)

    records = EmissionRecord.objects.filter(
        user=user,
        created_at__gte=start_of_month
    )

    daily_totals = defaultdict(float)
    for r in records:
        daily_totals[r.created_at.date()] += r.total_co2

    _, last_day = calendar.monthrange(today.year, today.month)
    heatmap_data = []

    for day in range(1, last_day + 1):
        current_date = datetime.date(today.year, today.month, day)
        footprint = daily_totals.get(current_date, 0)

        if footprint > 0:
            intensity = 'green' if footprint < 10 else 'yellow' if footprint < 20 else 'red'
        else:
            intensity = 'green'

        heatmap_data.append({
            "date": current_date.isoformat(),
            "footprint": round(footprint, 2),
            "intensity": intensity
        })

    return Response({
        "month": today.strftime("%B %Y"),
        "data": heatmap_data
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_leaderboard(request):
    current_user = request.user

    results = (
        EmissionRecord.objects.values('user_id')
        .annotate(avg_co2=Avg('total_co2'), record_count=Count('id'))
    )

    BADGES = [
        ('Eco Champion', 80),
        ('Green Leader', 60),
        ('Low Impact',   40),
        ('Eco Beginner',  0),
    ]

    def badge_for(score):
        for label, threshold in BADGES:
            if score >= threshold:
                return label
        return 'Eco Beginner'

    user_map = {u.id: u for u in User.objects.filter(id__in=[r['user_id'] for r in results])}

    board = []
    for row in results:
        u = user_map.get(row['user_id'])
        if not u:
            continue
        avg = row['avg_co2'] or 0
        score = max(0, round(100 - avg * 2))
        display = u.username or (u.name.split()[0] if u.name else f'User#{u.id}')
        board.append({
            'user_id':  u.id,
            'username': display,
            'score':    score,
            'badge':    badge_for(score),
            'is_me':    u.id == current_user.id,
        })

    board.sort(key=lambda x: x['score'], reverse=True)
    for i, entry in enumerate(board[:10], start=1):
        entry['rank'] = i

    return Response(board[:10], status=status.HTTP_200_OK)
