from django.urls import path

from .views import ProfileView, LocationView, RankingView


urlpatterns = [
    path(
        "profile/",
        ProfileView.as_view(),
        name="profile"
    ),
    path(
        "location/",
        LocationView.as_view(),
        name="location"
    ),
    path(
        "api/locations/save/",
        LocationView.as_view(),
        name="locations_save"
    ),
    path(
        "ranking/",
        RankingView.as_view(),
        name="ranking"
    ),
]
