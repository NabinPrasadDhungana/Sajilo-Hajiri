from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from django.contrib.auth import authenticate, login, logout
from .models import User, AttendanceRecord, Subject, ClassSubject, StudentClassEnrollment
from .serializers import UserRegistrationSerializer, UserLoginSerializer, AdminUserReviewSerializer, AttendanceRecordSerializer, SubjectSerializer, UserSerializer
import os
from django.db.models import Prefetch
from django.utils.timezone import localtime
from rest_framework.permissions import AllowAny

from .permissions import IsCustomAdmin 

# from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token

class RegisterUserView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(ensure_csrf_cookie)
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {'message': 'User registered successfully and is pending approval',
                 'user_id': user.id }, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(ensure_csrf_cookie)
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )

        if not user:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if user.approval_status != 'approved':
            return Response(
                {'error': 'Your account is not approved yet.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Session-based login
        login(request, user)  # This handles session creation
        
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data
        })

class CSRFTokenView(APIView):
    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        # Explicitly get and set CSRF token
        csrf_token = get_token(request)
        response = JsonResponse({'message': 'CSRF cookie set', 'csrfToken': csrf_token})
        response.set_cookie(
            'csrftoken',
            csrf_token,
            max_age=60 * 60 * 24 * 7,  # 1 week
            httponly=False,
            samesite='Lax',
            secure=True if request.is_secure() else False
        )
        return response

class LogoutView(APIView):
    def post(self, request):
        logout(request) # Django's built-in logout
        response = Response({'message': 'Logged out successfully'})
        response.delete_cookie('sessionid')
        return response


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
        # Simply return all possible dashboard data
        # Let the frontend decide which parts to use based on user role
        user = request.user
        data = {
            "user": UserSerializer(user).data,
            "student_data": self._get_student_data(user) if user.role == 'student' else None,
            "teacher_data": self._get_teacher_data(user) if user.role == 'teacher' else None,
            "admin_data": self._get_admin_data(user) if user.role == 'admin' else None,
        }
        return Response(data)

    def _get_student_data(self, user):
        try:
            enrolled_class = StudentClassEnrollment.objects.get(student=user).enrolled_class
            class_subjects = ClassSubject.objects.filter(class_instance=enrolled_class)
            attendance = AttendanceRecord.objects.filter(student=user).order_by('-entry_time')[:20]

            return {
                "class": enrolled_class.name,
                "subjects": SubjectSerializer([cs.subject for cs in class_subjects], many=True).data,
                "attendance": AttendanceRecordSerializer(attendance, many=True).data,
            }
        except StudentClassEnrollment.DoesNotExist:
            return {"error": "Student is not enrolled in any class."}

    def _get_teacher_data(self, user):
        classes_teaching = ClassSubject.objects.filter(teacher=user).select_related('class_instance', 'subject')
        return {
            "teaching": [
                {
                    "class": cs.class_instance.name,
                    "subject": cs.subject.name,
                    "students": UserSerializer(
                        User.objects.filter(
                            studentclassenrollment__enrolled_class=cs.class_instance,
                            role='student'
                        ),
                        many=True
                    ).data
                }
                for cs in classes_teaching
            ]
        }

    def _get_admin_data(self, user):
        pending_users = User.objects.filter(approval_status='pending')
        return {
            "stats": {
                "total_users": User.objects.count(),
                "total_students": User.objects.filter(role='student').count(),
                "total_teachers": User.objects.filter(role='teacher').count(),
                "pending_users": UserSerializer(pending_users, many=True).data,
            }
        }
    
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
