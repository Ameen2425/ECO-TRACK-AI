from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from api.views import (
    add_emission, get_history, get_dashboard, get_analytics, uploaded_file
)

def index_view(request):
    return JsonResponse({"message": "Eco-Track AI API is running (Django)"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),

    # Root index
    path('', index_view, name='index'),

    # Direct global aliases matching Flask routes
    path('api/sync', add_emission, name='global_sync_api'),
    path('sync', add_emission, name='global_sync'),
    path('api/records', get_history, name='global_records'),
    path('api/history', get_history, name='global_history'),
    path('api/dashboard', get_dashboard, name='global_dashboard'),
    path('api/analytics', get_analytics, name='global_analytics'),
    path('uploads/<str:filename>', uploaded_file, name='global_uploads'),
]
