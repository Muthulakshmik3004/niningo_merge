from django.urls import path
from . import views
from .views import ProfileView

urlpatterns = [
    # Mobile login
    path("mobile/", views.mobile_login, name="mobile_login"),

    # Profile
    path(
        "profile/",
        views.ProfileView.as_view(),
        name="profile"
    ),

    # Location / Geofence
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

    # Contacts / Task list
    path(
        "api/contacts/",
        views.contacts_list,
        name="contacts_list"
    ),

    # Groups
    path(
        "api/groups/",
        views.groups_list,
        name="groups_list"
    ),

    # WhatsApp-style Status / Moments
    path(
        "api/status/create/",
        views.create_status,
        name="create_status"
    ),
    path(
        "api/status/my/",
        views.my_status,
        name="my_status"
    ),
    path(
        "api/status/feed/",
        views.status_feed,
        name="status_feed"
    ),
    path(
        "api/status/view/",
        views.view_status,
        name="view_status"
    ),
    path(
        "api/status/viewers/",
        views.status_viewers,
        name="status_viewers"
    ),
    path(
        "api/status/delete/",
        views.delete_status,
        name="delete_status"
    ),

    # Contact matching & Connect
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
    path(
        "contacts/connect/",
        views.connect_friend,
        name="connect_friend"
    ),

    # Spark / Daily Mission Progress
    path(
        "api/spark/",
        views.spark_progress,
        name="spark_progress"
    ),
    path(
        "api/spark/delete-task/",
        views.delete_spark_task,
        name="delete_spark_task"
    ),

    # One-to-One Chat
    path(
        "api/chat/messages/",
        views.chat_messages_list,
        name="chat_messages_list"
    ),
    path(
        "api/chat/send/",
        views.chat_messages_list,
        name="chat_send",
    ),

    # Ranking / Leaderboard
    path(
        "ranking/",
        views.RankingView.as_view(),
        name="ranking",
    ),
]