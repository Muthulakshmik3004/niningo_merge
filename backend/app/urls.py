from django.urls import path
from . import views

from .views import ProfileView


urlpatterns = [
    path("mobile/", views.mobile_login, name="mobile_login"),

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile"
    ),

    path(
        "api/locations/save/",
        views.save_locations,
        name="save_locations"
    ),

    path(
        "api/geofence/config/",
        views.geofence_config,
        name="geofence_config"
    ),

    path(
        "api/geofence/verify/",
        views.verify_geofence,
        name="verify_geofence"
    ),

    path(
        "match-contacts/",
        views.match_contacts,
        name="match_contacts"
    ),

    path(
        "contacts/match/",
        views.match_contacts,
        name="contacts_match"
    ),
]