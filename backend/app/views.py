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