from rest_framework import permissions


class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owner of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or view.action == 'upvote':
            return True
        return obj.author == request.user
