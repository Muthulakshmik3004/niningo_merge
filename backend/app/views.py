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