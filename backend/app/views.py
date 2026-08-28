import math
import re
from datetime import datetime

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Contact,
    Group,
    OfficeGeofence,
    Profile,
    StatusUpdate,
    StatusViewer,
    SparkProgress,
)


def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371000.0

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1)
        * math.cos(phi2)
        * math.sin(delta_lambda / 2.0) ** 2
    )

    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return R * c


# =========================================================
# Location
# =========================================================

@api_view(["POST"])
def save_locations(request):
    data = request.data

    username = data.get("username")
    phone_number = data.get("phone_number")

    if not username and not phone_number:
        return Response(
            {"error": "username or phone_number is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        profile = None

        if username:
            profile = Profile.objects(username=username).first()

        if not profile and phone_number:
            profile = Profile.objects(phone_number=phone_number).first()

        if not profile:
            return Response(
                {"error": "No profile found for target user"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if "home_address" in data:
            profile.home_address = data["home_address"]

        if "home_latitude" in data:
            profile.home_latitude = (
                float(data["home_latitude"])
                if data["home_latitude"] is not None
                else None
            )

        if "home_longitude" in data:
            profile.home_longitude = (
                float(data["home_longitude"])
                if data["home_longitude"] is not None
                else None
            )

        if "office_address" in data:
            profile.office_address = data["office_address"]

        if "office_latitude" in data:
            profile.office_latitude = (
                float(data["office_latitude"])
                if data["office_latitude"] is not None
                else None
            )

        if "office_longitude" in data:
            profile.office_longitude = (
                float(data["office_longitude"])
                if data["office_longitude"] is not None
                else None
            )

        profile.location_updated_at = datetime.utcnow()
        profile.location_completed = True
        profile.save()

        return Response(
            {
                "message": "Locations saved to profile successfully",
                "profile": {
                    "username": profile.username,
                    "phone_number": profile.phone_number,
                    "home_address": profile.home_address,
                    "home_latitude": profile.home_latitude,
                    "home_longitude": profile.home_longitude,
                    "office_address": profile.office_address,
                    "office_latitude": profile.office_latitude,
                    "office_longitude": profile.office_longitude,
                },
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# =========================================================
# Geofence
# =========================================================

@api_view(["GET", "POST"])
def geofence_config(request):

    if request.method == "GET":
        office = OfficeGeofence.objects(is_active=True).first()

        if not office:
            office = OfficeGeofence(
                office_name="TGS Head Office",
                latitude=13.0827,
                longitude=80.2707,
                radius_meters=150.0,
            )
            office.save()

        return Response(
            {
                "office_name": office.office_name,
                "latitude": office.latitude,
                "longitude": office.longitude,
                "radius_meters": office.radius_meters,
            },
            status=status.HTTP_200_OK,
        )

    data = request.data

    latitude = data.get("latitude")
    longitude = data.get("longitude")

    if latitude is None or longitude is None:
        return Response(
            {"error": "latitude and longitude are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        OfficeGeofence.objects(is_active=True).update(is_active=False)

        office = OfficeGeofence(
            office_name=data.get("office_name", "TGS Head Office"),
            latitude=float(latitude),
            longitude=float(longitude),
            radius_meters=float(data.get("radius_meters", 100.0)),
            is_active=True,
            updated_at=datetime.utcnow(),
        )

        office.save()

        return Response(
            {
                "message": "Office geofence configured successfully",
                "config": {
                    "office_name": office.office_name,
                    "latitude": office.latitude,
                    "longitude": office.longitude,
                    "radius_meters": office.radius_meters,
                },
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def verify_geofence(request):

    data = request.data

    lat = data.get("latitude")
    lng = data.get("longitude")

    if lat is None or lng is None:
        return Response(
            {"error": "latitude and longitude are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        office = OfficeGeofence.objects(is_active=True).first()

        if not office:
            office = OfficeGeofence(
                office_name="TGS Head Office",
                latitude=13.0827,
                longitude=80.2707,
                radius_meters=150.0,
            )
            office.save()

        distance = haversine_distance(
            float(lat),
            float(lng),
            office.latitude,
            office.longitude,
        )

        in_geofence = distance <= office.radius_meters

        return Response(
            {
                "in_geofence": in_geofence,
                "distance_meters": round(distance, 2),
                "allowed_radius_meters": office.radius_meters,
                "office_name": office.office_name,
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# =========================================================
# Profile
# =========================================================

class ProfileView(APIView):

    def post(self, request):

        phone_number = request.data.get("phone_number")
        name = request.data.get("name")
        username = request.data.get("username")
        bio = request.data.get("bio", "")
        language = request.data.get("language", "")
        gender = request.data.get("gender", "")
        profile_image = request.data.get("profile_image", "")

        if not phone_number:
            return Response(
                {"error": "Phone number is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not name:
            return Response(
                {"error": "Name is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not username:
            return Response(
                {"error": "Username is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile = Profile.objects(
            phone_number=phone_number
        ).first()

        if not profile:
            profile = Profile(
                phone_number=phone_number,
                name=name,
                username=username,
            )

        else:
            existing_username = Profile.objects(
                username=username
            ).first()

            if (
                existing_username
                and str(existing_username.id) != str(profile.id)
            ):
                return Response(
                    {"error": "Username already exists"},
                    status=status.HTTP_409_CONFLICT,
                )

        profile.name = name
        profile.username = username
        profile.bio = bio
        profile.language = language
        profile.gender = gender
        profile.profile_image = profile_image or None
        profile.profile_completed = True

        profile.save()

        return Response(
            {
                "success": True,
                "message": "Profile saved successfully",
                "username": profile.username,
            }
        )


# =========================================================
# Mobile Login
# =========================================================

@api_view(["POST"])
def mobile_login(request):

    phone_number = request.data.get("phone_number")

    if not phone_number:
        return Response(
            {"error": "Phone number is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    profile = Profile.objects(
        phone_number=phone_number
    ).first()

    if not profile:
        col = Profile._get_collection()

        col.insert_one(
            {
                "phone_number": phone_number,
                "name": "",
                "bio": "",
                "language": "",
                "gender": "",
                "profile_completed": False,
                "location_completed": False,
            }
        )

        return Response(
            {
                "success": True,
                "exists": False,
                "next_screen": "profile",
            },
            status=status.HTTP_200_OK,
        )

    if not profile.profile_completed:
        return Response(
            {
                "success": True,
                "exists": True,
                "next_screen": "profile",
                "username": profile.username or "",
            }
        )

    if not profile.location_completed:
        return Response(
            {
                "success": True,
                "exists": True,
                "next_screen": "location",
                "username": profile.username or "",
            }
        )

    return Response(
        {
            "success": True,
            "exists": True,
            "next_screen": "tasks",
            "username": profile.username,
        }
    )


# =========================================================
# Contact Matching
# =========================================================

@api_view(["POST"])
def match_contacts(request):

    phone_numbers = request.data.get("phone_numbers", [])

    if not isinstance(phone_numbers, list):
        return Response(
            {"error": "phone_numbers must be a list"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    normalized_numbers = []

    for number in phone_numbers:

        if not number:
            continue

        number = str(number).strip()
        number = re.sub(r"[^\d+]", "", number)

        if len(number) == 10 and number.isdigit():
            number = "+91" + number

        elif number.startswith("0091"):
            number = "+" + number[2:]

        normalized_numbers.append(number)

    normalized_numbers = list(set(normalized_numbers))

    profiles = Profile.objects(
        phone_number__in=normalized_numbers
    )

    friends = []

    for profile in profiles:
        friends.append(
            {
                "name": profile.name or profile.username or "User",
                "phone_number": profile.phone_number,
                "username": profile.username or "",
            }
        )

    return Response(
        {
            "success": True,
            "friends": friends,
        },
        status=status.HTTP_200_OK,
    )


# =========================================================
# Contacts / Tasks
# =========================================================

def _contact_to_dict(contact):
    return {
        "id": str(contact.id),
        "name": contact.name,
        "image": contact.profile_image,
        "msg": contact.msg,
        "time": contact.time_label,
        "count": contact.count,
        "color": contact.color,
        "is_unread": contact.is_unread,
        "is_pending": contact.is_pending,
    }


@api_view(["GET", "POST"])
def contacts_list(request):

    if request.method == "POST":

        data = request.data

        owner_username = data.get("owner_username")
        name = data.get("name")

        if not owner_username or not name:
            return Response(
                {
                    "error": "owner_username and name are required"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        contact = Contact(
            owner_username=owner_username,
            name=name,
            profile_image=data.get("image", ""),
            msg=data.get("msg", ""),
            time_label=data.get("time", ""),
            count=int(data.get("count", 0) or 0),
            color=data.get("color", "#39E600"),
            is_unread=bool(data.get("is_unread", False)),
            is_pending=bool(data.get("is_pending", False)),
        )

        contact.save()

        return Response(
            {
                "success": True,
                "contact": _contact_to_dict(contact),
            },
            status=status.HTTP_201_CREATED,
        )

    owner_username = request.GET.get("owner", "")
    filter_type = request.GET.get(
        "filter",
        "all",
    ).lower()

    if not owner_username:
        return Response(
            {"error": "owner query param is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    qs = Contact.objects(
        owner_username=owner_username
    )

    if qs.count() == 0:

        seed = [
            dict(
                name="Arun",
                msg="Task Assigned",
                time_label="11:54 am",
                count=1,
                profile_image="https://i.pravatar.cc/150?img=1",
                color="#39E600",
                is_unread=True,
            ),
            dict(
                name="Usagi",
                msg="Task Assigned",
                time_label="9:55 am",
                count=1,
                profile_image="https://i.pravatar.cc/150?img=2",
                color="#39E600",
                is_unread=True,
            ),
            dict(
                name="Praveen",
                msg="Task Assigned",
                time_label="Yesterday",
                count=1,
                profile_image="https://i.pravatar.cc/150?img=3",
                color="#FF8A00",
                is_pending=True,
            ),
            dict(
                name="Natasa",
                msg="Task Assigned",
                time_label="Yesterday",
                count=1,
                profile_image="https://i.pravatar.cc/150?img=4",
                color="#FF8A00",
                is_pending=True,
            ),
            dict(
                name="Kuina",
                msg="Task Assigned",
                time_label="Yesterday",
                count=1,
                profile_image="https://i.pravatar.cc/150?img=5",
                color="#FF8A00",
                is_pending=True,
            ),
        ]

        for row in seed:
            Contact(
                owner_username=owner_username,
                **row,
            ).save()

        qs = Contact.objects(
            owner_username=owner_username
        )

    if filter_type == "unread":
        qs = qs.filter(is_unread=True)

    elif filter_type == "pending":
        qs = qs.filter(is_pending=True)

    qs = qs.order_by("-created_at")

    return Response(
        {
            "results": [
                _contact_to_dict(contact)
                for contact in qs
            ]
        },
        status=status.HTTP_200_OK,
    )


# =========================================================
# Groups
# =========================================================

def _group_to_dict(group):
    return {
        "id": str(group.id),
        "name": group.name,
        "image": group.image,
        "time": group.time_label,
    }


@api_view(["GET", "POST"])
def groups_list(request):

    if request.method == "POST":

        data = request.data

        owner_username = data.get("owner_username")
        name = data.get("name")

        if not owner_username or not name:
            return Response(
                {
                    "error": "owner_username and name are required"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        group = Group(
            owner_username=owner_username,
            name=name,
            image=data.get("image", ""),
            time_label=data.get("time", ""),
        )

        group.save()

        return Response(
            {
                "success": True,
                "group": _group_to_dict(group),
            },
            status=status.HTTP_201_CREATED,
        )

    owner_username = request.GET.get("owner", "")

    if not owner_username:
        return Response(
            {"error": "owner query param is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    qs = Group.objects(
        owner_username=owner_username
    )

    if qs.count() == 0:

        seed = [
            dict(
                name="Office",
                time_label="Yesterday",
                image="https://i.pravatar.cc/150?img=3",
            ),
            dict(
                name="Family",
                time_label="Yesterday",
                image="https://i.pravatar.cc/150?img=4",
            ),
            dict(
                name="Friends",
                time_label="Yesterday",
                image="https://i.pravatar.cc/150?img=5",
            ),
        ]

        for row in seed:
            Group(
                owner_username=owner_username,
                **row,
            ).save()

        qs = Group.objects(
            owner_username=owner_username
        )

    qs = qs.order_by("-created_at")

    return Response(
        {
            "results": [
                _group_to_dict(group)
                for group in qs
            ]
        },
        status=status.HTTP_200_OK,
    )


# =========================================================
# Status / Moments
# =========================================================

def _status_to_dict(status_obj, viewer_username=None):

    return {
        "id": str(status_obj.id),
        "username": status_obj.username,
        "name": status_obj.name,
        "profile_image": status_obj.profile_image,
        "content_image": status_obj.content_image,
        "caption": status_obj.caption,
        "created_at": status_obj.created_at.isoformat(),
        "expires_at": status_obj.expires_at.isoformat(),
        "viewer_count": len(status_obj.viewers),
        "viewed_by_me": (
            bool(viewer_username)
            and any(
                viewer.viewer_username == viewer_username
                for viewer in status_obj.viewers
            )
        ),
    }


@api_view(["POST"])
def create_status(request):

    data = request.data

    username = data.get("username")
    content_image = (
        data.get("content_image")
        or data.get("profile_image")
    )

    if not username:
        return Response(
            {"error": "username is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not content_image:
        return Response(
            {
                "error": (
                    "content_image "
                    "(or profile_image) is required"
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    profile = Profile.objects(
        username=username
    ).first()

    entry = StatusUpdate(
        username=username,
        name=(
            data.get("name")
            or (profile.name if profile else username)
        ),
        profile_image=(
            data.get("profile_image")
            or (profile.profile_image if profile else "")
        ),
        content_image=content_image,
        caption=data.get("caption", ""),
    )

    entry.save()

    return Response(
        {
            "success": True,
            "status": _status_to_dict(entry),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
def my_status(request):

    username = request.GET.get("username", "")

    if not username:
        return Response(
            {"error": "username query param is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    qs = StatusUpdate.objects(
        username=username,
        expires_at__gt=datetime.utcnow(),
    ).order_by("-created_at")

    seen = set()

    for status_obj in qs:
        for viewer in status_obj.viewers:
            seen.add(viewer.viewer_username)

    return Response(
        {
            "results": [
                _status_to_dict(status_obj)
                for status_obj in qs
            ],
            "total_unique_viewers": len(seen),
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
def status_feed(request):

    username = request.GET.get("username", "")

    qs = StatusUpdate.objects(
        expires_at__gt=datetime.utcnow()
    )

    if username:
        qs = qs.filter(username__ne=username)

    qs = qs.order_by("-created_at")

    latest_by_user = {}

    for status_obj in qs:
        if status_obj.username not in latest_by_user:
            latest_by_user[status_obj.username] = status_obj

    results = [
        _status_to_dict(
            status_obj,
            viewer_username=username,
        )
        for status_obj in latest_by_user.values()
    ]

    return Response(
        {"results": results},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
def view_status(request):

    data = request.data

    status_id = data.get("status_id")
    viewer_username = data.get("viewer_username")

    if not status_id or not viewer_username:
        return Response(
            {
                "error": (
                    "status_id and viewer_username "
                    "are required"
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    entry = StatusUpdate.objects(
        id=status_id
    ).first()

    if not entry:
        return Response(
            {"error": "Status not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if entry.username == viewer_username:
        return Response(
            {
                "success": True,
                "status": _status_to_dict(entry),
            },
            status=status.HTTP_200_OK,
        )

    already_viewed = any(
        viewer.viewer_username == viewer_username
        for viewer in entry.viewers
    )

    if not already_viewed:

        entry.viewers.append(
            StatusViewer(
                viewer_username=viewer_username,
                viewer_name=data.get("viewer_name", ""),
                viewer_image=data.get("viewer_image", ""),
            )
        )

        entry.save()

    return Response(
        {
            "success": True,
            "status": _status_to_dict(
                entry,
                viewer_username=viewer_username,
            ),
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
def status_viewers(request):

    status_id = request.GET.get(
        "status_id",
        "",
    )

    if not status_id:
        return Response(
            {"error": "status_id query param is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    entry = StatusUpdate.objects(
        id=status_id
    ).first()

    if not entry:
        return Response(
            {"error": "Status not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    viewers = [
        {
            "username": viewer.viewer_username,
            "name": viewer.viewer_name,
            "image": viewer.viewer_image,
            "viewed_at": viewer.viewed_at.isoformat(),
        }
        for viewer in sorted(
            entry.viewers,
            key=lambda viewer: viewer.viewed_at,
            reverse=True,
        )
    ]

    return Response(
        {
            "status_id": str(entry.id),
            "viewer_count": len(viewers),
            "viewers": viewers,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["DELETE"])
def delete_status(request):

    status_id = request.GET.get(
        "status_id",
        "",
    )

    username = request.GET.get(
        "username",
        "",
    )

    if not status_id or not username:
        return Response(
            {
                "error": (
                    "status_id and username "
                    "are required"
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    entry = StatusUpdate.objects(
        id=status_id,
        username=username,
    ).first()

    if not entry:
        return Response(
            {
                "error": (
                    "Status not found or "
                    "you are not the owner"
                )
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    entry.delete()

    return Response(
        {
            "success": True,
            "message": "Status deleted successfully",
        },
        status=status.HTTP_200_OK,
    )

    # =========================================================
# Spark / Daily Mission Progress
# =========================================================

def _spark_to_dict(spark):
    return {
        "id": str(spark.id),
        "username": spark.username,
        "date": spark.date,
        "tasks": spark.tasks,
        "created_at": spark.created_at.isoformat(),
        "updated_at": spark.updated_at.isoformat(),
    }


@api_view(["GET", "POST"])
def spark_progress(request):

    # -----------------------------------------------------
    # GET
    # Get all Spark progress for a user
    #
    # Example:
    # /app/spark/?username=Aishu
    #
    # Or specific date:
    # /app/spark/?username=Aishu&date=2026-08-24
    # -----------------------------------------------------
    if request.method == "GET":

        username = request.GET.get("username", "")
        date = request.GET.get("date", "")

        if not username:
            return Response(
                {"error": "username query param is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            if date:
                spark = SparkProgress.objects(
                    username=username,
                    date=date,
                ).first()

                if not spark:
                    return Response(
                        {
                            "success": True,
                            "exists": False,
                            "date": date,
                            "tasks": {},
                        },
                        status=status.HTTP_200_OK,
                    )

                return Response(
                    {
                        "success": True,
                        "exists": True,
                        "spark": _spark_to_dict(spark),
                    },
                    status=status.HTTP_200_OK,
                )

            # Get ALL previous dates
            sparks = SparkProgress.objects(
                username=username
            ).order_by("date")

            return Response(
                {
                    "success": True,
                    "results": [
                        _spark_to_dict(spark)
                        for spark in sparks
                    ],
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    # -----------------------------------------------------
    # POST
    # Save / update one mission for one date
    #
    # Example body:
    #
    # {
    #   "username": "Aishu",
    #   "date": "2026-08-24",
    #   "task": "Hydration",
    #   "completed": true,
    #   "photo": "image-uri"
    # }
    # -----------------------------------------------------
    data = request.data

    username = data.get("username")
    date = data.get("date")
    task = data.get("task")

    if not username:
        return Response(
            {"error": "username is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not date:
        return Response(
            {"error": "date is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not task:
        return Response(
            {"error": "task is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Find existing record for this user + date
        spark = SparkProgress.objects(
            username=username,
            date=date,
        ).first()

        # If this date doesn't have a record yet,
        # create one.
        if not spark:
            spark = SparkProgress(
                username=username,
                date=date,
                tasks={},
            )

        completed = data.get("completed", True)
        photo = data.get("photo", "")

        # Save this mission
        spark.tasks[task] = {
            "completed": bool(completed),
            "photo": photo or "",
        }

        spark.updated_at = datetime.utcnow()
        spark.save()

        return Response(
            {
                "success": True,
                "message": "Spark progress saved successfully",
                "spark": _spark_to_dict(spark),
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# =========================================================
# Spark - Delete / Reset One Mission
# =========================================================

@api_view(["DELETE"])
def delete_spark_task(request):

    username = request.GET.get("username", "")
    date = request.GET.get("date", "")
    task = request.GET.get("task", "")

    if not username or not date or not task:
        return Response(
            {
                "error": (
                    "username, date and task "
                    "are required"
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        spark = SparkProgress.objects(
            username=username,
            date=date,
        ).first()

        if not spark:
            return Response(
                {
                    "error": "Spark progress not found"
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if task in spark.tasks:
            del spark.tasks[task]

            spark.updated_at = datetime.utcnow()
            spark.save()

        return Response(
            {
                "success": True,
                "message": "Spark task deleted successfully",
                "spark": _spark_to_dict(spark),
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )