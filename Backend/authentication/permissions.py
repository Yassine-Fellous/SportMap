from rest_framework.permissions import BasePermission
from .models import RoleChoices

class IsSuperAdmin(BasePermission):
    """
    Seul le SUPER_ADMIN a accès (ou un utlisateur avec is_admin legacy)
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == RoleChoices.SUPER_ADMIN or getattr(request.user, 'is_admin', False))
        )

class IsMunicipalAgent(BasePermission):
    """
    Agent de mairie ou Super Admin
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in [RoleChoices.MUNICIPAL_AGENT, RoleChoices.SUPER_ADMIN]
        )

class IsClubManager(BasePermission):
    """
    Gérant de club privé ou Super Admin
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in [RoleChoices.CLUB_MANAGER, RoleChoices.SUPER_ADMIN]
        )

class IsAdvertiser(BasePermission):
    """
    Annonceur ou Super Admin
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in [RoleChoices.ADVERTISER, RoleChoices.SUPER_ADMIN]
        )
