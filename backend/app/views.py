import math
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime

from .models import UserLocation, OfficeGeofence


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
    Save or update home/office coordinates for a user.
    Body: { user_id, home_address, home_latitude, home_longitude,
            office_address, office_latitude, office_longitude }
    """
    data = request.data
    user_id = data.get("user_id")

    if not user_id:
        return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_loc = UserLocation.objects(user_id=user_id).first()
        if not user_loc:
            user_loc = UserLocation(user_id=user_id)

        if "home_address" in data:
            user_loc.home_address = data["home_address"]
        if "home_latitude" in data:
            user_loc.home_latitude = float(data["home_latitude"]) if data["home_latitude"] is not None else None
        if "home_longitude" in data:
            user_loc.home_longitude = float(data["home_longitude"]) if data["home_longitude"] is not None else None

        if "office_address" in data:
            user_loc.office_address = data["office_address"]
        if "office_latitude" in data:
            user_loc.office_latitude = float(data["office_latitude"]) if data["office_latitude"] is not None else None
        if "office_longitude" in data:
            user_loc.office_longitude = float(data["office_longitude"]) if data["office_longitude"] is not None else None

        user_loc.updated_at = datetime.utcnow()
        user_loc.save()

        return Response({
            "message": "Locations saved successfully",
            "user_location": {
                "user_id": user_loc.user_id,
                "home_address": user_loc.home_address,
                "home_latitude": user_loc.home_latitude,
                "home_longitude": user_loc.home_longitude,
                "office_address": user_loc.office_address,
                "office_latitude": user_loc.office_latitude,
                "office_longitude": user_loc.office_longitude,
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
