from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Profile, Ranking


class ProfileView(APIView):

    def get(self, request):
        username = request.query_params.get("username", "")
        if not username:
            return Response(
                {"error": "Username is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile = Profile.objects(username=username).first()
        if not profile:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            {
                "success": True,
                "profile": {
                    "id": str(profile.id),
                    "name": profile.name,
                    "username": profile.username,
                    "bio": profile.bio,
                    "language": profile.language,
                    "gender": profile.gender,
                    "theme": profile.theme,
                    "profile_image": profile.profile_image,
                    "home_location": profile.home_location,
                    "office_location": profile.office_location,
                }
            },
            status=status.HTTP_200_OK
        )

    def post(self, request):
        name = request.data.get("name")
        username = request.data.get("username")
        bio = request.data.get("bio", "")
        language = request.data.get("language", "")
        gender = request.data.get("gender", "")
        theme = request.data.get("theme", "purple")
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

        existing_profile = Profile.objects(username=username).first()

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
            theme=theme,
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
                    "theme": profile.theme,
                    "profile_image": profile.profile_image,
                    "home_location": profile.home_location,
                    "office_location": profile.office_location,
                }
            },
            status=status.HTTP_201_CREATED
        )

    def patch(self, request):
        username = request.data.get("username", "")
        if not username:
            return Response(
                {"error": "Username is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile = Profile.objects(username=username).first()
        if not profile:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        new_username = request.data.get("username", "").strip()
        if new_username and new_username != profile.username:
            return Response(
                {"error": "Username cannot be changed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        update_fields = {}
        if "name" in request.data:
            update_fields["set__name"] = request.data.get("name", "").strip()
        if "bio" in request.data:
            update_fields["set__bio"] = request.data.get("bio", "").strip()
        if "theme" in request.data:
            update_fields["set__theme"] = request.data.get("theme", "purple").strip()
        if "profile_image" in request.data:
            update_fields["set__profile_image"] = request.data.get("profile_image", "") or None
        if "language" in request.data:
            update_fields["set__language"] = request.data.get("language", "").strip()
        if "gender" in request.data:
            update_fields["set__gender"] = request.data.get("gender", "").strip()

        if update_fields:
            Profile.objects(username=username).update(**update_fields)
            profile.reload()

        return Response(
            {
                "success": True,
                "message": "Profile updated successfully",
                "profile": {
                    "id": str(profile.id),
                    "name": profile.name,
                    "username": profile.username,
                    "bio": profile.bio,
                    "language": profile.language,
                    "gender": profile.gender,
                    "theme": profile.theme,
                    "profile_image": profile.profile_image,
                    "home_location": profile.home_location,
                    "office_location": profile.office_location,
                }
            },
            status=status.HTTP_200_OK
        )


class LocationView(APIView):

    def post(self, request):
        username = request.data.get("username", "")
        home_location = request.data.get("home_location", "") or request.data.get("home_address", "")
        office_location = request.data.get("office_location", "") or request.data.get("office_address", "")

        if username:
            profile = Profile.objects(username=username).first()
            if profile:
                profile.home_location = home_location
                profile.office_location = office_location
                profile.save()

        return Response(
            {
                "success": True,
                "message": "Location saved successfully",
                "home_location": home_location,
                "office_location": office_location,
            },
            status=status.HTTP_200_OK
        )

    def get(self, request):
        username = request.query_params.get("username", "")
        if username:
            profile = Profile.objects(username=username).first()
            if profile:
                return Response(
                    {
                        "home_location": profile.home_location,
                        "office_location": profile.office_location,
                    },
                    status=status.HTTP_200_OK
                )
        return Response(
            {"home_location": "", "office_location": ""},
            status=status.HTTP_200_OK
        )


class RankingView(APIView):

    def get(self, request):
        username = request.query_params.get("username", "")
        scope = request.query_params.get("scope", "contacts")

        if not username:
            return Response(
                {"error": "Username is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile = Profile.objects(username=username).first()
        if not profile:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if scope not in ("contacts", "tirunelveli"):
            scope = "contacts"

        rankings = Ranking.objects(scope=scope).order_by("-points", "-completed_tasks")
        ranking_list = []
        for index, item in enumerate(rankings, start=1):
            ranking_list.append({
                "rank": index,
                "username": item.username,
                "display_name": item.display_name or item.username,
                "points": item.points,
                "completed_tasks": item.completed_tasks,
                "family": item.family,
                "location": item.location,
            })

        current_user_ranking = Ranking.objects(username=username, scope=scope).first()
        current_user = {
            "username": username,
            "display_name": current_user_ranking.display_name if current_user_ranking else profile.name,
            "points": current_user_ranking.points if current_user_ranking else 0,
            "completed_tasks": current_user_ranking.completed_tasks if current_user_ranking else 0,
            "family": current_user_ranking.family if current_user_ranking else "",
            "location": current_user_ranking.location if current_user_ranking else "",
        }

        return Response(
            {
                "success": True,
                "scope": scope,
                "current_user": current_user,
                "rankings": ranking_list,
            },
            status=status.HTTP_200_OK
        )
