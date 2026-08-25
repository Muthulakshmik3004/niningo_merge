import math
import re
from datetime import datetime

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    ChatMessage,
    Contact,
    Group,
    OfficeGeofence,
    Profile,
    StatusUpdate,
    StatusViewer,
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
    """
    Match phone contacts from the mobile device against registered
    Profile phone numbers.

    Both mobile numbers and database numbers are normalized before
    comparison so values such as:
        +919994347785
        919994347785
        99994347785
        '+919994347785
        +91 99994 347785
    can match the same Indian phone number.
    """

    def normalize_phone(phone):
        if not phone:
            return None

        # Convert to string and remove accidental quotes/whitespace.
        phone = str(phone).strip()
        phone = phone.replace("'", "").replace('"', "")

        # Keep digits only for reliable comparison.
        digits = re.sub(r"\D", "", phone)

        if not digits:
            return None

        # Indian 10-digit mobile number.
        if len(digits) == 10:
            return "+91" + digits

        # Indian number with country code 91 (e.g. 919994347785).
        if len(digits) == 12 and digits.startswith("91"):
            return "+" + digits

        # Indian number starting with 0 (e.g. 09994347785).
        if len(digits) == 11 and digits.startswith("0"):
            return "+91" + digits[1:]

        # Already an international number.
        if phone.startswith("+") and len(digits) >= 10:
            return "+" + digits

        return "+" + digits if len(digits) >= 10 else phone

    phone_numbers = request.data.get("phone_numbers", [])

    if not isinstance(phone_numbers, list):
        return Response(
            {"error": "phone_numbers must be a list"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # Normalize phone numbers received from the mobile device
    # ---------------------------------------------------------
    normalized_numbers = []

    for number in phone_numbers:
        normalized = normalize_phone(number)

        if normalized:
            normalized_numbers.append(normalized)

    normalized_numbers = list(set(normalized_numbers))

    print("[Mobile normalized contacts]:", normalized_numbers)

    # ---------------------------------------------------------
    # Read profiles directly from MongoDB collection.
    # This avoids MongoEngine throwing FieldDoesNotExist for old
    # fields like home_location / office_location.
    # ---------------------------------------------------------
    collection = Profile._get_collection()

    mongo_profiles = collection.find(
        {},
        {
            "phone_number": 1,
            "name": 1,
            "username": 1,
            "profile_image": 1,
        },
    )

    current_username = str(
        request.data.get("username")
        or request.GET.get("username")
        or ""
    ).strip().lower()

    friends = []

    for profile in mongo_profiles:
        raw_uname = profile.get("username")
        prof_username = str(raw_uname if raw_uname is not None else "").strip().lower()
        if current_username and prof_username == current_username:
            continue

        db_phone = normalize_phone(profile.get("phone_number"))

        print(
            "[Checking profile]:",
            prof_username,
            "| DB:",
            profile.get("phone_number"),
            "| Normalized:",
            db_phone,
        )

        if db_phone and db_phone in normalized_numbers:
            raw_name = profile.get("name")
            display_name = str(raw_name) if raw_name else (prof_username or "User")
            friends.append(
                {
                    "name": display_name,
                    "phone_number": db_phone,
                    "username": prof_username,
                    "profile_image": str(profile.get("profile_image") or ""),
                }
            )

    print("[Matched registered friends]:", len(friends))

    return Response(
        {
            "success": True,
            "friends": friends,
            "contacts": friends,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
def connect_friend(request):
    data = request.data
    owner_username = str(data.get("owner_username") or data.get("owner") or "").strip().lower()
    friend_username = str(data.get("friend_username") or data.get("target_username") or "").strip().lower()

    if not owner_username or not friend_username:
        return Response(
            {"error": "owner_username and friend_username are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    owner_prof = Profile.objects(username__iexact=owner_username).first()
    friend_prof = Profile.objects(username__iexact=friend_username).first()

    owner_name = str(owner_prof.name if (owner_prof and owner_prof.name) else owner_username)
    friend_name = str(friend_prof.name if (friend_prof and friend_prof.name) else friend_username)
    owner_img = str(owner_prof.profile_image if owner_prof else "")
    friend_img = str(friend_prof.profile_image if friend_prof else "")

    c1 = Contact.objects(
        owner_username=owner_username,
        target_username__iexact=friend_username,
    ).first()

    if not c1:
        c1 = Contact(
            owner_username=owner_username,
            name=friend_name,
            target_username=friend_username,
            profile_image=friend_img,
            msg="Connected on Niningo",
            time_label="Just now",
            color="#39E600",
        )
        c1.save()

    c2 = Contact.objects(
        owner_username=friend_username,
        target_username__iexact=owner_username,
    ).first()

    if not c2:
        c2 = Contact(
            owner_username=friend_username,
            name=owner_name,
            target_username=owner_username,
            profile_image=owner_img,
            msg="Connected on Niningo",
            time_label="Just now",
            color="#39E600",
        )
        c2.save()

    return Response(
        {"success": True, "message": "Connected successfully"},
        status=status.HTTP_200_OK,
    )


# =========================================================
# Contacts / Tasks
# =========================================================

def _contact_to_dict(contact):
    return {
        "id": str(contact.id),
        "name": contact.name,
        "username": contact.target_username or "",
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
        target_username = data.get("target_username", "")

        if not owner_username or not name:
            return Response(
                {
                    "error": "owner_username and name are required"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if contact already exists for owner to avoid duplicates
        existing_contact = None
        if target_username:
            existing_contact = Contact.objects(
                owner_username=owner_username,
                target_username__iexact=target_username,
            ).first()

        if not existing_contact:
            existing_contact = Contact.objects(
                owner_username=owner_username,
                name__iexact=name,
            ).first()

        if existing_contact:
            contact = existing_contact
            if target_username and not contact.target_username:
                contact.target_username = target_username
            contact.profile_image = data.get("image", contact.profile_image)
            contact.msg = data.get("msg", contact.msg)
            contact.time_label = data.get("time", contact.time_label)
        else:
            contact = Contact(
                owner_username=owner_username,
                name=name,
                target_username=target_username,
                profile_image=data.get("image", ""),
                msg=data.get("msg", ""),
                time_label=data.get("time", ""),
                count=int(data.get("count", 0) or 0),
                color=data.get("color", "#39E600"),
                is_unread=bool(data.get("is_unread", False)),
                is_pending=bool(data.get("is_pending", False)),
            )

        contact.save()

        # Bidirectional connection: If target_username or matching profile exists, also create connection for target user
        target_prof = None
        if target_username:
            target_prof = Profile.objects(username__iexact=target_username).first()
        if not target_prof:
            target_prof = Profile.objects(name__iexact=name).first()

        if target_prof and target_prof.username and target_prof.username.lower() != owner_username.lower():
            owner_prof = Profile.objects(username__iexact=owner_username).first()
            owner_display_name = owner_prof.name if (owner_prof and owner_prof.name) else owner_username

            t_contact = Contact.objects(
                owner_username=target_prof.username,
                target_username__iexact=owner_username,
            ).first()

            if not t_contact:
                t_contact = Contact.objects(
                    owner_username=target_prof.username,
                    name__iexact=owner_display_name,
                ).first()

            if not t_contact:
                t_contact = Contact(
                    owner_username=target_prof.username,
                    target_username=owner_username,
                    name=owner_display_name,
                    profile_image=owner_prof.profile_image if (owner_prof and owner_prof.profile_image) else "",
                    msg="Connected on Niningo",
                    time_label="Just now",
                    color="#39E600",
                )
            else:
                t_contact.target_username = owner_username
            t_contact.save()

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

    if filter_type == "unread":
        qs = qs.filter(is_unread=True)

    elif filter_type == "pending":
        qs = qs.filter(is_pending=True)

    qs = qs.order_by("-created_at")

    # Deduplicate contacts so each friend appears only once in task list
    seen_keys = set()
    deduped_results = []
    for contact in qs:
        # Auto-fill missing target_username from Profile DB if not set
        if not contact.target_username:
            prof = Profile.objects(name__iexact=contact.name).first()
            if not prof:
                prof = Profile.objects(username__iexact=contact.name).first()
            if prof and prof.username:
                contact.target_username = prof.username
                try:
                    contact.save()
                except Exception:
                    pass

        key = (contact.target_username or contact.name or "").strip().lower()
        if key and key not in seen_keys:
            seen_keys.add(key)
            deduped_results.append(_contact_to_dict(contact))

    return Response(
        {
            "results": deduped_results
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
# Chat Messages API (One-to-One Chat)
# =========================================================

@api_view(["GET", "POST"])
def chat_messages_list(request):
    """
    POST: Send a new chat message between two users
    GET: Fetch conversation messages between user1 and user2
    """
    if request.method == "POST":
        data = request.data
        sender = (data.get("sender_username") or "").strip()
        receiver = (data.get("receiver_username") or "").strip()
        text = (data.get("text") or "").strip()

        if not sender or not receiver or not text:
            return Response(
                {"error": "sender_username, receiver_username, and text are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        conv_key = "_".join(sorted([sender.lower(), receiver.lower()]))

        msg = ChatMessage(
            sender_username=sender,
            receiver_username=receiver,
            conversation_key=conv_key,
            text=text,
            created_at=datetime.utcnow(),
        )
        msg.save()

        time_str = datetime.now().strftime("%I:%M %p").lstrip("0").lower()

        # Update last message in sender's contact list
        receiver_prof = Profile.objects(username__iexact=receiver).first()
        receiver_display_name = receiver_prof.name if (receiver_prof and receiver_prof.name) else receiver

        c1 = Contact.objects(owner_username=sender, target_username__iexact=receiver).first()
        if not c1:
            c1 = Contact.objects(owner_username=sender, name__iexact=receiver_display_name).first()
        if not c1:
            c1 = Contact(owner_username=sender, name=receiver_display_name, target_username=receiver)
        c1.target_username = receiver
        c1.msg = text
        c1.time_label = time_str
        c1.save()

        # Update last message in receiver's contact list
        sender_prof = Profile.objects(username__iexact=sender).first()
        sender_display_name = sender_prof.name if (sender_prof and sender_prof.name) else sender

        c2 = Contact.objects(owner_username=receiver, target_username__iexact=sender).first()
        if not c2:
            c2 = Contact.objects(owner_username=receiver, name__iexact=sender_display_name).first()
        if not c2:
            c2 = Contact(owner_username=receiver, name=sender_display_name, target_username=sender)
        c2.target_username = sender
        c2.msg = text
        c2.time_label = time_str
        c2.count = (c2.count or 0) + 1
        c2.is_unread = True
        c2.save()

        return Response(
            {
                "success": True,
                "message": {
                    "id": str(msg.id),
                    "sender_username": msg.sender_username,
                    "receiver_username": msg.receiver_username,
                    "text": msg.text,
                    "created_at": msg.created_at.isoformat(),
                },
            },
            status=status.HTTP_201_CREATED,
        )

    # GET method
    user1 = (request.GET.get("user1") or "").lower().strip()
    user2 = (request.GET.get("user2") or "").lower().strip()

    if not user1 or not user2:
        return Response(
            {"error": "user1 and user2 query params are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    conv_key = "_".join(sorted([user1, user2]))
    messages = ChatMessage.objects(conversation_key=conv_key).order_by("created_at")

    messages_data = [
        {
            "id": str(m.id),
            "sender_username": m.sender_username,
            "receiver_username": m.receiver_username,
            "text": m.text,
            "created_at": m.created_at.isoformat() if m.created_at else "",
        }
        for m in messages
    ]

    return Response(
        {
            "success": True,
            "messages": messages_data,
        },
        status=status.HTTP_200_OK,
    )
