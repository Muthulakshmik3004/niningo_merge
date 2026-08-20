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

    # Contacts / Task list (All, Unread, Pending tabs)
    path('api/contacts/', views.contacts_list, name='contacts_list'),

    # Groups tab
    path('api/groups/', views.groups_list, name='groups_list'),

    # WhatsApp-style Status / Moments
    path('api/status/create/', views.create_status, name='create_status'),
    path('api/status/my/', views.my_status, name='my_status'),
    path('api/status/feed/', views.status_feed, name='status_feed'),
    path('api/status/view/', views.view_status, name='view_status'),
    path('api/status/viewers/', views.status_viewers, name='status_viewers'),
    path(
    'api/status/delete/',
    views.delete_status,
    name='delete_status'
),
]