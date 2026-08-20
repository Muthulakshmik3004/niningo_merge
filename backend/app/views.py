import math
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime

from .models import OfficeGeofence, Profile


def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371000.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


@api_view(['POST'])
def save_locations(request):
    """
    Save or update home/office location fields on the user's Profile document
    so that both profile + location data live in the same 'profiles' collection.
    Body: { username, home_address, home_latitude, home_longitude,
            office_address, office_latitude, office_longitude }
    """
    data = request.data
    username = data.get("username")

    if not username:
        return Response({"error": "username is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        profile = Profile.objects(username=username).first()
        if not profile:
            return Response(
                {"error": f"No profile found for username '{username}'"},
                status=status.HTTP_404_NOT_FOUND
            )

        if "home_address" in data:
            profile.home_address = data["home_address"]
        if "home_latitude" in data:
            profile.home_latitude = float(data["home_latitude"]) if data["home_latitude"] is not None else None
        if "home_longitude" in data:
            profile.home_longitude = float(data["home_longitude"]) if data["home_longitude"] is not None else None

        if "office_address" in data:
            profile.office_address = data["office_address"]
        if "office_latitude" in data:
            profile.office_latitude = float(data["office_latitude"]) if data["office_latitude"] is not None else None
        if "office_longitude" in data:
            profile.office_longitude = float(data["office_longitude"]) if data["office_longitude"] is not None else None

        profile.location_updated_at = datetime.utcnow()
        profile.save()

        return Response({
            "message": "Locations saved to profile successfully",
            "profile": {
                "username": profile.username,
                "home_address": profile.home_address,
                "home_latitude": profile.home_latitude,
                "home_longitude": profile.home_longitude,
                "office_address": profile.office_address,
                "office_latitude": profile.office_latitude,
                "office_longitude": profile.office_longitude,
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
def geofence_config(request):
    """
    GET:  Returns active office geofence. Auto-creates default if none exists.
    POST: Creates a new active geofence config.
    """
    if request.method == 'GET':
        office = OfficeGeofence.objects(is_active=True).first()
        if not office:
            office = OfficeGeofence(
                office_name="TGS Head Office",
                latitude=13.0827,
                longitude=80.2707,
                radius_meters=150.0
            )
            office.save()

        return Response({
            "office_name": office.office_name,
            "latitude": office.latitude,
            "longitude": office.longitude,
            "radius_meters": office.radius_meters,
        }, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        data = request.data
        latitude = data.get("latitude")
        longitude = data.get("longitude")

        if latitude is None or longitude is None:
            return Response({"error": "latitude and longitude are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            OfficeGeofence.objects(is_active=True).update(is_active=False)
            office = OfficeGeofence(
                office_name=data.get("office_name", "TGS Head Office"),
                latitude=float(latitude),
                longitude=float(longitude),
                radius_meters=float(data.get("radius_meters", 100.0)),
                is_active=True,
                updated_at=datetime.utcnow()
            )
            office.save()
            return Response({
                "message": "Office geofence configured successfully",
                "config": {
                    "office_name": office.office_name,
                    "latitude": office.latitude,
                    "longitude": office.longitude,
                    "radius_meters": office.radius_meters,
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def verify_geofence(request):
    """
    Verify if coordinates fall within the active office geofence.
    Body: { latitude, longitude }
    """
    data = request.data
    lat = data.get("latitude")
    lng = data.get("longitude")

    if lat is None or lng is None:
        return Response({"error": "latitude and longitude are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        office = OfficeGeofence.objects(is_active=True).first()
        if not office:
            office = OfficeGeofence(
                office_name="TGS Head Office",
                latitude=13.0827,
                longitude=80.2707,
                radius_meters=150.0
            )
            office.save()

        dist = haversine_distance(float(lat), float(lng), office.latitude, office.longitude)
        in_geofence = dist <= office.radius_meters

        return Response({
            "in_geofence": in_geofence,
            "distance_meters": round(dist, 2),
            "allowed_radius_meters": office.radius_meters,
            "office_name": office.office_name,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Profile


class ProfileView(APIView):

    def post(self, request):

        name = request.data.get("name")
        username = request.data.get("username")
        bio = request.data.get("bio", "")
        language = request.data.get("language", "")
        gender = request.data.get("gender", "")
        profile_image = request.data.get("profile_image", "")

        if not name:
            return Response(
                {"error": "Name is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not username:
            return Response(
                {"error": "Username is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check duplicate username
        existing_profile = Profile.objects(
            username=username
        ).first()

        if existing_profile:
            return Response(
                {"error": "Username already exists"},
                status=status.HTTP_409_CONFLICT
            )

        profile = Profile(
            name=name,
            username=username,
            bio=bio,
            language=language,
            gender=gender,
            profile_image=profile_image or None
        )

        profile.save()

        return Response(
            {
                "success": True,
                "message": "Profile saved successfully",
                "profile": {
                    "id": str(profile.id),
                    "name": profile.name,
                    "username": profile.username,
                    "bio": profile.bio,
                    "language": profile.language,
                    "gender": profile.gender,
                    "profile_image": profile.profile_image
                }
            },
            status=status.HTTP_201_CREATED
        )

# ─────────────────────────────────────────────────────────
#  Contacts / Task list  (All / Unread / Pending tabs)
# ─────────────────────────────────────────────────────────
from .models import Contact, Group, StatusUpdate, StatusViewer  # noqa: E402


def _contact_to_dict(c):
    return {
        "id": str(c.id),
        "name": c.name,
        "image": c.profile_image,
        "msg": c.msg,
        "time": c.time_label,
        "count": c.count,
        "color": c.color,
        "is_unread": c.is_unread,
        "is_pending": c.is_pending,
    }


@api_view(['GET', 'POST'])
def contacts_list(request):
    """
    GET  /app/api/contacts/?owner=<username>&filter=all|unread|pending
         Returns the contact/task rows for that user, stored in MongoDB.
         Auto-seeds a starter set the first time a user has none, so the
         screen isn't empty on a fresh account.

    POST /app/api/contacts/   { owner_username, name, image, msg, time,
                                 count, color, is_unread, is_pending }
         Creates a new contact/task row (used by the "+" button).
    """
    if request.method == 'POST':
        data = request.data
        owner_username = data.get("owner_username")
        name = data.get("name")

        if not owner_username or not name:
            return Response({"error": "owner_username and name are required"}, status=status.HTTP_400_BAD_REQUEST)

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
        return Response({"success": True, "contact": _contact_to_dict(contact)}, status=status.HTTP_201_CREATED)

    # GET
    owner_username = request.GET.get("owner", "")
    filter_type = request.GET.get("filter", "all").lower()

    if not owner_username:
        return Response({"error": "owner query param is required"}, status=status.HTTP_400_BAD_REQUEST)

    qs = Contact.objects(owner_username=owner_username)

    if qs.count() == 0:
        # Seed some starter data so a brand new account still sees a working list
        seed = [
            dict(name="Arun", msg="Task Assigned", time_label="11:54 am", count=1,
                 profile_image="https://i.pravatar.cc/150?img=1", color="#39E600", is_unread=True),
            dict(name="Usagi", msg="Task Assigned", time_label="9:55 am", count=1,
                 profile_image="https://i.pravatar.cc/150?img=2", color="#39E600", is_unread=True),
            dict(name="Praveen", msg="Task Assigned", time_label="Yesterday", count=1,
                 profile_image="https://i.pravatar.cc/150?img=3", color="#FF8A00", is_pending=True),
            dict(name="Natasa", msg="Task Assigned", time_label="Yesterday", count=1,
                 profile_image="https://i.pravatar.cc/150?img=4", color="#FF8A00", is_pending=True),
            dict(name="Kuina", msg="Task Assigned", time_label="Yesterday", count=1,
                 profile_image="https://i.pravatar.cc/150?img=5", color="#FF8A00", is_pending=True),
        ]
        for row in seed:
            Contact(owner_username=owner_username, **row).save()
        qs = Contact.objects(owner_username=owner_username)

    if filter_type == "unread":
        qs = qs.filter(is_unread=True)
    elif filter_type == "pending":
        qs = qs.filter(is_pending=True)
    # "all" -> no extra filter

    qs = qs.order_by("-created_at")
    return Response({"results": [_contact_to_dict(c) for c in qs]}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────
#  Groups tab
# ─────────────────────────────────────────────────────────
def _group_to_dict(g):
    return {
        "id": str(g.id),
        "name": g.name,
        "image": g.image,
        "time": g.time_label,
    }


@api_view(['GET', 'POST'])
def groups_list(request):
    """
    GET  /app/api/groups/?owner=<username>  -> list groups for that user (seeds starter groups once).
    POST /app/api/groups/  { owner_username, name, image, time } -> create a group.
    """
    if request.method == 'POST':
        data = request.data
        owner_username = data.get("owner_username")
        name = data.get("name")

        if not owner_username or not name:
            return Response({"error": "owner_username and name are required"}, status=status.HTTP_400_BAD_REQUEST)

        group = Group(
            owner_username=owner_username,
            name=name,
            image=data.get("image", ""),
            time_label=data.get("time", ""),
        )
        group.save()
        return Response({"success": True, "group": _group_to_dict(group)}, status=status.HTTP_201_CREATED)

    owner_username = request.GET.get("owner", "")
    if not owner_username:
        return Response({"error": "owner query param is required"}, status=status.HTTP_400_BAD_REQUEST)

    qs = Group.objects(owner_username=owner_username)
    if qs.count() == 0:
        seed = [
            dict(name="Office", time_label="Yesterday", image="https://i.pravatar.cc/150?img=3"),
            dict(name="Family", time_label="Yesterday", image="https://i.pravatar.cc/150?img=4"),
            dict(name="Friends", time_label="Yesterday", image="https://i.pravatar.cc/150?img=5"),
        ]
        for row in seed:
            Group(owner_username=owner_username, **row).save()
        qs = Group.objects(owner_username=owner_username)

    qs = qs.order_by("-created_at")
    return Response({"results": [_group_to_dict(g) for g in qs]}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────
#  WhatsApp style Status / Moments
# ─────────────────────────────────────────────────────────
def _status_to_dict(s, viewer_username=None):
    return {
        "id": str(s.id),
        "username": s.username,
        "name": s.name,
        "profile_image": s.profile_image,
        "content_image": s.content_image,
        "caption": s.caption,
        "created_at": s.created_at.isoformat(),
        "expires_at": s.expires_at.isoformat(),
        "viewer_count": len(s.viewers),
        "viewed_by_me": bool(viewer_username) and any(v.viewer_username == viewer_username for v in s.viewers),
    }


@api_view(['POST'])
def create_status(request):
    """
    POST /app/api/status/create/
    Body: { username, name, profile_image, content_image, caption }
    Posts a new status/moment for the logged-in user (own profile photo + status).
    """
    data = request.data
    username = data.get("username")
    content_image = data.get("content_image") or data.get("profile_image")

    if not username:
        return Response({"error": "username is required"}, status=status.HTTP_400_BAD_REQUEST)
    if not content_image:
        return Response({"error": "content_image (or profile_image) is required"}, status=status.HTTP_400_BAD_REQUEST)

    profile = Profile.objects(username=username).first()

    entry = StatusUpdate(
        username=username,
        name=data.get("name") or (profile.name if profile else username),
        profile_image=data.get("profile_image") or (profile.profile_image if profile else ""),
        content_image=content_image,
        caption=data.get("caption", ""),
    )
    entry.save()

    return Response({"success": True, "status": _status_to_dict(entry)}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def my_status(request):
    """
    GET /app/api/status/my/?username=<username>
    Returns the logged-in user's own active (last 24h) statuses for the
    "My Moment" ring on the Moments/Status page, including how many people
    have viewed each one.
    """
    username = request.GET.get("username", "")
    if not username:
        return Response({"error": "username query param is required"}, status=status.HTTP_400_BAD_REQUEST)

    qs = StatusUpdate.objects(username=username, expires_at__gt=datetime.utcnow()).order_by("-created_at")

    total_viewers = 0
    seen = set()
    for s in qs:
        for v in s.viewers:
            if v.viewer_username not in seen:
                seen.add(v.viewer_username)
                total_viewers += 1

    return Response({
        "results": [_status_to_dict(s) for s in qs],
        "total_unique_viewers": total_viewers,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def status_feed(request):
    """
    GET /app/api/status/feed/?username=<username>
    "Recent Updates" — latest active status per other user (excludes own).
    """
    username = request.GET.get("username", "")

    qs = StatusUpdate.objects(expires_at__gt=datetime.utcnow())
    if username:
        qs = qs.filter(username__ne=username)
    qs = qs.order_by("-created_at")

    latest_by_user = {}
    for s in qs:
        if s.username not in latest_by_user:
            latest_by_user[s.username] = s

    results = [_status_to_dict(s, viewer_username=username) for s in latest_by_user.values()]
    return Response({"results": results}, status=status.HTTP_200_OK)


@api_view(['POST'])
def view_status(request):
    """
    POST /app/api/status/view/
    Body: { status_id, viewer_username, viewer_name, viewer_image }
    Records that `viewer_username` viewed a status (used when someone opens
    another person's Moment). Duplicate views by the same person are ignored.
    """
    data = request.data
    status_id = data.get("status_id")
    viewer_username = data.get("viewer_username")

    if not status_id or not viewer_username:
        return Response({"error": "status_id and viewer_username are required"}, status=status.HTTP_400_BAD_REQUEST)

    entry = StatusUpdate.objects(id=status_id).first()
    if not entry:
        return Response({"error": "Status not found"}, status=status.HTTP_404_NOT_FOUND)

    if entry.username == viewer_username:
        # owner opening their own status doesn't count as a "view"
        return Response({"success": True, "status": _status_to_dict(entry)}, status=status.HTTP_200_OK)

    already_viewed = any(v.viewer_username == viewer_username for v in entry.viewers)
    if not already_viewed:
        entry.viewers.append(StatusViewer(
            viewer_username=viewer_username,
            viewer_name=data.get("viewer_name", ""),
            viewer_image=data.get("viewer_image", ""),
        ))
        entry.save()

    return Response({"success": True, "status": _status_to_dict(entry, viewer_username=viewer_username)}, status=status.HTTP_200_OK)


@api_view(['GET'])
def status_viewers(request):
    """
    GET /app/api/status/viewers/?status_id=<id>
    Returns the full list of members who viewed a given status — used for
    the "My Moments -> how many people viewed" screen (WhatsApp's
    "viewed by" list).
    """
    status_id = request.GET.get("status_id", "")
    if not status_id:
        return Response({"error": "status_id query param is required"}, status=status.HTTP_400_BAD_REQUEST)

    entry = StatusUpdate.objects(id=status_id).first()
    if not entry:
        return Response({"error": "Status not found"}, status=status.HTTP_404_NOT_FOUND)

    viewers = [
        {
            "username": v.viewer_username,
            "name": v.viewer_name,
            "image": v.viewer_image,
            "viewed_at": v.viewed_at.isoformat(),
        }
        for v in sorted(entry.viewers, key=lambda x: x.viewed_at, reverse=True)
    ]

    return Response({
        "status_id": str(entry.id),
        "viewer_count": len(viewers),
        "viewers": viewers,
    }, status=status.HTTP_200_OK)

@api_view(['DELETE'])
def delete_status(request):
    """
    DELETE /app/api/status/delete/?status_id=<id>&username=<username>

    Deletes the user's own status.
    """
    status_id = request.GET.get("status_id", "")
    username = request.GET.get("username", "")

    if not status_id or not username:
        return Response(
            {"error": "status_id and username are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    entry = StatusUpdate.objects(
        id=status_id,
        username=username
    ).first()

    if not entry:
        return Response(
            {"error": "Status not found or you are not the owner"},
            status=status.HTTP_404_NOT_FOUND
        )

    entry.delete()

    return Response(
        {
            "success": True,
            "message": "Status deleted successfully"
        },
        status=status.HTTP_200_OK
    )