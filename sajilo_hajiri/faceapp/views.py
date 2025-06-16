from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import User
import os

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_approve_user(request, user_id):
    if request.user.role != 'admin':
        return Response({'error': 'Only admins can perform this action.'}, status=403)

    try:
        user = User.objects.get(id=user_id)
        user.approval_status = 'approved'
        user.feedback = ''
        user.save()
        return Response({'message': f"{user.username} approved."})
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_unapprove_user(request, user_id):
    if request.user.role != 'admin':
        return Response({'error': 'Only admins can perform this action.'}, status=403)

    try:
        feedback = request.data.get('feedback', '')
        user = User.objects.get(id=user_id)
        user.approval_status = 'unapproved'
        user.feedback = feedback
        user.save()
        return Response({'message': f"{user.username} unapproved with feedback."})
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_decline_user(request, user_id):
    if request.user.role != 'admin':
        return Response({'error': 'Only admins can perform this action.'}, status=403)

    try:
        user = User.objects.get(id=user_id)
        # Delete avatar
        if user.avatar and os.path.isfile(user.avatar.path):
            os.remove(user.avatar.path)
        user.delete()
        return Response({'message': f"{user.username} declined and removed."})
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)
