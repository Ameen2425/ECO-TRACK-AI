from django.urls import path
from api.views import (
    register, login, disabled_otp, get_profile, update_profile, upload_image, uploaded_file,
    add_emission, get_dashboard, get_history, update_emission, delete_emission,
    get_analytics, get_heatmap, get_leaderboard,
    manage_settings
)

urlpatterns = [
    # Auth
    path('auth/register', register, name='register'),
    path('auth/login', login, name='login'),
    path('auth/send-otp', disabled_otp, name='send_otp'),
    path('auth/verify-otp', disabled_otp, name='verify_otp'),
    path('auth/profile', get_profile, name='get_profile'),
    path('auth/profile/update', update_profile, name='update_profile_alias'),
    path('auth/upload-image', upload_image, name='upload_image'),
    path('auth/profile/upload-image', upload_image, name='profile_upload_image_alias'),
    path('auth/uploads/<str:filename>', uploaded_file, name='uploaded_file_alias'),

    # Emissions
    path('emissions/add', add_emission, name='add_emission'),
    path('emissions/sync', add_emission, name='sync_emission_alias'),
    path('emissions/dashboard', get_dashboard, name='emissions_dashboard'),
    path('emissions/history', get_history, name='emissions_history'),
    path('emissions/records', get_history, name='emissions_records_alias'),
    path('emissions/update/<int:record_id>', update_emission, name='update_emission'),
    path('emissions/<int:record_id>', update_emission, name='update_emission_alt'),
    path('emissions/delete/<int:record_id>', delete_emission, name='delete_emission'),

    # Analytics
    path('analytics/', get_analytics, name='get_analytics'),
    path('analytics/heatmap', get_heatmap, name='get_heatmap'),
    path('analytics/dashboard', get_dashboard, name='analytics_dashboard_alias'),
    path('analytics/leaderboard', get_leaderboard, name='get_leaderboard'),

    # Settings
    path('settings/', manage_settings, name='manage_settings'),
]
