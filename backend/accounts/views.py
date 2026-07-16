from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import EmailTokenObtainPairSerializer, MeSerializer, RegisterSerializer


class RegisterView(generics.CreateAPIView):
    """POST /api/v1/auth/register/ -> 201 {"id","email","first_name"}"""
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {'id': user.id, 'email': user.email, 'first_name': user.first_name},
            status=201,
        )


class EmailTokenObtainPairView(TokenObtainPairView):
    """POST /api/v1/auth/token/ {"email","password"} -> {"access","refresh"}"""
    serializer_class = EmailTokenObtainPairSerializer
    permission_classes = (permissions.AllowAny,)


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/me/"""
    serializer_class = MeSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user
