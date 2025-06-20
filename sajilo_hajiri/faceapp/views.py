from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserRegistrationSerializer, UserLoginSerializer, AdminUserReviewSerializer
import os

from .permissions import IsCustomAdmin 

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def admin_approve_user(request, user_id):
#     if request.user.role != 'admin':
#         return Response({'error': 'Only admins can perform this action.'}, status=403)

#     try:
#         user = User.objects.get(id=user_id)
#         user.approval_status = 'approved'
#         user.feedback = ''
#         user.save()
#         return Response({'message': f"{user.username} approved."})
#     except User.DoesNotExist:
#         return Response({'error': 'User not found.'}, status=404)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def admin_unapprove_user(request, user_id):
#     if request.user.role != 'admin':
#         return Response({'error': 'Only admins can perform this action.'}, status=403)

#     try:
#         feedback = request.data.get('feedback', '')
#         user = User.objects.get(id=user_id)
#         user.approval_status = 'unapproved'
#         user.feedback = feedback
#         user.save()
#         return Response({'message': f"{user.username} unapproved with feedback."})
#     except User.DoesNotExist:
#         return Response({'error': 'User not found.'}, status=404)

# @api_view(['DELETE'])
# @permission_classes([IsAuthenticated])
# def admin_decline_user(request, user_id):
#     if request.user.role != 'admin':
#         return Response({'error': 'Only admins can perform this action.'}, status=403)

#     try:
#         user = User.objects.get(id=user_id)
#         # Delete avatar
#         if user.avatar and os.path.isfile(user.avatar.path):
#             os.remove(user.avatar.path)
#         user.delete()
#         return Response({'message': f"{user.username} declined and removed."})
#     except User.DoesNotExist:
#         return Response({'error': 'User not found.'}, status=404)

class RegisterUserView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User registered successfully and is pending approval'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(username=serializer.validated_data['username'], password=serializer.validated_data['password'])
            if user:
                if user.approval_status == 'approved':
                    return Response({
                        'message': 'Login successful',
                        'user': {
                            'id': user.id,
                            'username': user.username,
                            'role': user.role,
                            'name': user.name,
                            'avatar': user.avatar.url if user.avatar else None
                        }
                    })
                else:
                    return Response({'error': 'Your account is not approved yet.'}, status=status.HTTP_403_FORBIDDEN)
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminReviewUserView(APIView):
    permission_classes = [IsCustomAdmin]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminUserReviewSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            prev_status = user.approval_status
            serializer.save()

            if prev_status == 'pending' and serializer.validated_data['approval_status'] == 'unapproved':     # only delete if going from pending → unapproved
                # Delete avatar if exists
                if user.avatar and os.path.isfile(user.avatar.path):
                    os.remove(user.avatar.path)
                user.delete()
                return Response({'message': 'User unapproved and deleted'}, status=status.HTTP_200_OK)

            if serializer.validated_data['approval_status'] == 'approved':
                return Response({'message': 'User approved successfully'}, status=status.HTTP_200_OK)

            return Response({'message': 'User feedback added'}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)