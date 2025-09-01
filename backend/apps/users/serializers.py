from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import Group
from .models import User

class UserSerializer(serializers.ModelSerializer):
    # Adicionamos um campo 'role' que não está no modelo, mas que usaremos para
    # atribuir um grupo ao utilizador no momento do registo.
    role = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        # Adicionamos 'first_name' e 'last_name' aos campos.
        fields = (
            "id",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "role", # Adicionamos o nosso campo extra aqui.
        )
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        # Removemos o campo 'role' dos dados antes de criar o utilizador,
        # pois ele não pertence ao modelo User.
        role_name = validated_data.pop('role', 'Broker') # O padrão será 'Broker' se nada for enviado.

        # Criamos o utilizador com os dados restantes.
        user = User.objects.create_user(**validated_data)

        # Atribuímos o grupo (papel) ao utilizador.
        try:
            group = Group.objects.get(name=role_name)
            user.groups.add(group)
        except Group.DoesNotExist:
            # Se o grupo não existir, pode adicionar uma lógica para lidar com isso,
            # como atribuir um grupo padrão ou lançar um erro.
            # Por agora, simplesmente não fazemos nada.
            pass

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Adiciona informações extra (claims) ao token JWT.
        # O frontend poderá ler estas informações sem precisar de outra chamada à API.
        token["username"] = user.username
        token["roles"] = [group.name for group in user.groups.all()]

        return token
