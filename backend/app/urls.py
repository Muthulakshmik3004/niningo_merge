from django.urls import path
from . import views

from .views import ProfileView


urlpatterns = [
    path('api/locations/save/', views.save_locations, name='save_locations'),
    path('api/geofence/config/', views.geofence_config, name='geofence_config'),
    path('api/geofence/verify/', views.verify_geofence, name='verify_geofence'),
    path(
        "profile/",
        ProfileView.as_view(),
        name="profile"
    ),
]