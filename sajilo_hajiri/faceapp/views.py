from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from django.contrib.auth import authenticate
from .models import User, AttendanceRecord, Subject, ClassSubject, StudentClassEnrollment
from .serializers import UserRegistrationSerializer, UserLoginSerializer, AdminUserReviewSerializer, AttendanceRecordSerializer, SubjectSerializer, UserSerializer
import os
from django.db.models import Prefetch
from django.utils.timezone import localtime

from .permissions import IsCustomAdmin 

# from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

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
                            'roll_number': user.roll_number,
                            'avatar': user.avatar.url if user.avatar else None
                        }
                    })
                else:
                    return Response({'error': 'Your account is not approved yet.'}, status=status.HTTP_403_FORBIDDEN)
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFTokenView(APIView):
    def get(self, request):
        return JsonResponse({'message': 'CSRF cookie set'})


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
    
# @method_decorator(csrf_exempt, name='dispatch')
class DashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == 'student':
            return self._student_dashboard(user)

        elif user.role == 'teacher':
            return self._teacher_dashboard(user)

        elif user.role == 'admin':
            return self._admin_dashboard(user)

        return Response({"error": "Invalid role"}, status=400)

    def _student_dashboard(self, user):
        try:
            enrolled_class = StudentClassEnrollment.objects.get(student=user).enrolled_class
        except StudentClassEnrollment.DoesNotExist:
            return Response({"error": "Student is not enrolled in any class."}, status=404)

        class_subjects = ClassSubject.objects.filter(class_instance=enrolled_class)
        attendance = AttendanceRecord.objects.filter(student=user).order_by('-entry_time')[:20]

        return Response({
            "user": UserSerializer(user).data,
            "class": enrolled_class.name,
            "subjects": SubjectSerializer([cs.subject for cs in class_subjects], many=True).data,
            "attendance": AttendanceRecordSerializer(attendance, many=True).data,
        })

    def _teacher_dashboard(self, user):
        classes_teaching = ClassSubject.objects.filter(teacher=user).select_related('class_instance', 'subject')
        response = []

        for cs in classes_teaching:
            response.append({
                "class": cs.class_instance.name,
                "subject": cs.subject.name,
                "students": UserSerializer(User.objects.filter(
                    studentclassenrollment__enrolled_class=cs.class_instance,
                    role='student'
                ), many=True).data
            })

        return Response({
            "user": UserSerializer(user).data,
            "teaching": response
        })

    def _admin_dashboard(self, user):
        pending_users = User.objects.filter(approval_status='pending')
        total_users = User.objects.count()
        total_students = User.objects.filter(role='student').count()
        total_teachers = User.objects.filter(role='teacher').count()

        return Response({
            "user": UserSerializer(user).data,
            "stats": {
                "total_users": total_users,
                "total_students": total_students,
                "total_teachers": total_teachers,
                "pending_users": UserSerializer(pending_users, many=True).data,
            }
        })
    
class StudentAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Ensure only students can access this endpoint
        if user.role != 'student':
            return Response({'error': 'Unauthorized access'}, status=status.HTTP_403_FORBIDDEN)

        # Get all attendance records for this student
        records = AttendanceRecord.objects.filter(student=user).select_related('attendance_session__class_subject__subject')

        # Serialize the relevant fields
        data = []
        for record in records:
            data.append({
                'id': record.id,
                'entry_time': localtime(record.entry_time).isoformat() if record.entry_time else None,
                'entry_status': record.entry_status,
                'entry_method': record.entry_method,
                'exit_time': localtime(record.exit_time).isoformat() if record.exit_time else None,
                'exit_status': record.exit_status,
                'exit_method': record.exit_method,
                'subject_name': record.attendance_session.class_subject.subject.name,
                'date': record.attendance_session.date.isoformat(),
            })

        return Response(data, status=status.HTTP_200_OK)
