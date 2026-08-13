from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from api.models import UserSettings

def _get_or_create_settings(user):
    s, _ = UserSettings.objects.get_or_create(user=user)
    return s

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def manage_settings(request):
    s = _get_or_create_settings(request.user)
    if request.method == 'GET':
        return Response({
            "daily_reminder":      s.daily_reminder,
            "weekly_summary":      s.weekly_summary,
            "goal_reminder":       s.goal_reminder,
            "reminder_frequency":  s.reminder_frequency,
            "animations_enabled":  s.animations_enabled,
        }, status=status.HTTP_200_OK)

    data = request.data
    if 'daily_reminder'     in data: s.daily_reminder     = bool(data['daily_reminder'])
    if 'weekly_summary'     in data: s.weekly_summary     = bool(data['weekly_summary'])
    if 'goal_reminder'      in data: s.goal_reminder      = bool(data['goal_reminder'])
    if 'reminder_frequency' in data: s.reminder_frequency = data['reminder_frequency']
    if 'animations_enabled' in data: s.animations_enabled = bool(data['animations_enabled'])

    s.save()
    return Response({"msg": "Settings saved"}, status=status.HTTP_200_OK)
