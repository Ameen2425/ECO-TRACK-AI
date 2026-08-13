from django.db import models
from django.utils import timezone

class User(models.Model):
    name = models.CharField(max_length=100, null=True, blank=True)
    username = models.CharField(max_length=80, null=True, blank=True)
    email = models.CharField(max_length=120, unique=True, null=True, blank=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    profile_image = models.CharField(max_length=255, null=True, blank=True)
    password_hash = models.CharField(max_length=128)
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def __str__(self):
        return self.username or self.name or f"User #{self.id}"

class OTPRecord(models.Model):
    contact = models.CharField(max_length=120)
    otp_code = models.CharField(max_length=6)
    expiry_time = models.DateTimeField()
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

class EmissionRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emissions')
    transport_km = models.FloatField(default=0.0)
    transport_type = models.CharField(max_length=50, null=True, blank=True)
    electricity_kwh = models.FloatField(default=0.0)
    diet_type = models.CharField(max_length=50, null=True, blank=True)
    gas_usage = models.FloatField(default=0.0)
    waste_kg = models.FloatField(default=0.0)
    total_co2 = models.FloatField()
    created_at = models.DateTimeField(default=timezone.now)

    # Detailed fields
    vehicle_model = models.CharField(max_length=100, null=True, blank=True)
    fuel_detail = models.CharField(max_length=100, null=True, blank=True)
    vehicle_age_years = models.IntegerField(default=0)
    age_multiplier = models.FloatField(default=1.0)
    ac_hours = models.FloatField(default=0.0)
    house_size = models.CharField(max_length=50, null=True, blank=True)
    geyser_usage = models.IntegerField(default=0)
    has_refrigerator = models.BooleanField(default=True)
    cooking_fuel = models.CharField(max_length=50, null=True, blank=True)
    cooking_frequency = models.CharField(max_length=50, null=True, blank=True)
    waste_type = models.CharField(max_length=50, null=True, blank=True)
    recycling_habit = models.CharField(max_length=50, null=True, blank=True)
    composting = models.BooleanField(default=False)
    meal_frequency = models.CharField(max_length=50, null=True, blank=True)
    dairy_level = models.CharField(max_length=50, null=True, blank=True)
    family_size = models.CharField(max_length=50, null=True, blank=True)
    entry_mode = models.CharField(max_length=50, default='detailed')

    def __str__(self):
        return f"Emission #{self.id} for User #{self.user_id}: {self.total_co2} kg CO2"

class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    type = models.CharField(max_length=50)
    target_value = models.FloatField()
    current_progress = models.FloatField(default=0.0)

class Leaderboard(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leaderboard_entries')
    sustainability_score = models.FloatField(default=0.0)
    badge = models.CharField(max_length=50, default='Eco Beginner')

class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    daily_reminder = models.BooleanField(default=True)
    weekly_summary = models.BooleanField(default=True)
    goal_reminder = models.BooleanField(default=True)
    reminder_frequency = models.CharField(max_length=50, default='daily')
    animations_enabled = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
