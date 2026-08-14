from django.urls import path
from . import views

urlpatterns = [
    path('api/locations/save/', views.save_locations, name='save_locations'),
    path('api/geofence/config/', views.geofence_config, name='geofence_config'),
    path('api/geofence/verify/', views.verify_geofence, name='verify_geofence'),
]