from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth import authenticate, login, logout
from .models import User, AttendanceRecord, Subject, ClassSubject, StudentClassEnrollment
from .serializers import UserRegistrationSerializer, UserLoginSerializer, AdminUserReviewSerializer, AttendanceRecordSerializer, SubjectSerializer, UserSerializer
from django.utils.timezone import localtime
from rest_framework.permissions import AllowAny

from .permissions import IsCustomAdmin 

from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

class RegisterUserView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(ensure_csrf_cookie)
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'errors': serializer.errors,
                'message': 'Validation failed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        
        user = serializer.save()
        return Response(
            {'message': 'User registered successfully and is pending approval',
             'user_id': user.id }, 
            status=status.HTTP_201_CREATED
        )
    
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
        
        # if user.approval_status != 'approved':
        #     return Response(
        #         {'error': 'Your account is not approved yet.'}, 
        #         status=status.HTTP_403_FORBIDDEN
        #     )
        
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
        # csrf_token = get_token(request)
        # response = JsonResponse({'message': 'CSRF cookie set', 'csrfToken': csrf_token})
        response = JsonResponse({'message': 'CSRF cookie set'})
        # response.set_cookie(
        #     'csrftoken',
        #     csrf_token,
        #     max_age=60 * 60 * 24 * 7,  # 1 week
        #     httponly=False,
        #     samesite='Lax',
        #     secure=True if request.is_secure() else False
        # )
        return response

class LogoutView(APIView):
    def post(self, request):
        logout(request) # Django's built-in logout
        response = Response({'message': 'Logged out successfully'})
        response.delete_cookie('sessionid')
        return response

class AdminStatsAPIView(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request):
        return Response({
            "total_users": User.objects.count(),
            "total_students": User.objects.filter(role='student').count(),
            "total_teachers": User.objects.filter(role='teacher').count(),
            "total_pending": User.objects.filter(approval_status='pending').count(),
        })


class PendingUsersAPIView(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request):
        pending_users = User.objects.filter(approval_status='pending')
        serializer = UserSerializer(pending_users, many=True)
        return Response(serializer.data)


class UserApprovalAPIView(APIView):
    permission_classes = [IsCustomAdmin]

    def post(self, request):
        email = request.data.get("email")
        action = request.data.get("action")  # 'approve' or 'unapprove'

        try:
            user = User.objects.get(email=email)
            if action == "approve":
                user.approval_status = 'approved'
                user.feedback = ''
            elif action == "unapprove":
                user.approval_status = 'unapproved'
            else:
                return Response({"error": "Invalid action"}, status=400)
            user.save()
            return Response({"message": f"User {action}d successfully."})
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)


class SendFeedbackAPIView(APIView):
    permission_classes = [IsCustomAdmin]

    def post(self, request):
        email = request.data.get("email")
        feedback = request.data.get("feedback")

        try:
            user = User.objects.get(email=email)
            user.feedback = feedback
            user.save()
            return Response({"message": "Feedback sent successfully."})
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

    
# @method_decorator(ensure_csrf_cookie, name='dispatch')
class DashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Simply return all possible dashboard data
        # Let the frontend decide which parts to use based on user role
        user = request.user
        role = user.role
        data = {
            "user": UserSerializer(user).data,
            "student_data": self._get_student_data(user) if role == 'student' else None,
            "teacher_data": self._get_teacher_data(user) if role == 'teacher' else None,
            "admin_data": self._get_admin_data(user) if role == 'admin' else None,
        }
        return Response(data)

    def _get_student_data(self, user):
        try:
            enrollment = StudentClassEnrollment.objects.select_related('enrolled_class').get(student=user)
            enrolled_class = enrollment.enrolled_class
            class_subjects = ClassSubject.objects.select_related('subject').filter(class_instance=enrolled_class)
            attendance = AttendanceRecord.objects.select_related(
                'attendance_session__class_subject__subject'
            ).filter(student=user).order_by('-entry_time')[:20]

            return {
                "class": enrolled_class.name,
                "subjects": SubjectSerializer([cs.subject for cs in class_subjects], many=True).data,
                "attendance": [
                    {
                        "id": record.id,
                        "subject_name": record.attendance_session.class_subject.subject.name,
                        "entry_time": localtime(record.entry_time).isoformat() if record.entry_time else None,
                        "exit_time": localtime(record.exit_time).isoformat() if record.exit_time else None,
                        "entry_status": record.entry_status,
                        "exit_status": record.exit_status,
                        "entry_method": record.entry_method,
                        "exit_method": record.exit_method,
                        "date": record.attendance_session.date.isoformat(),
                    }
                    for record in attendance
                ],
            }
        except StudentClassEnrollment.DoesNotExist:
            return {"error": "Student is not enrolled in any class."}

    def _get_teacher_data(self, user):
        class_subjects = ClassSubject.objects.select_related('class_instance', 'subject').filter(teacher=user)

        teaching_data = []
        for cs in class_subjects:
            students = User.objects.filter(
                studentclassenrollment__enrolled_class=cs.class_instance,
                role='student'
            )
            teaching_data.append({
                "class": cs.class_instance.name,
                "subject": cs.subject.name,
                "students": UserSerializer(students, many=True).data
            })

        return { "teaching": teaching_data }

    # def _get_admin_data(self, user):
    #     pending_users = User.objects.filter(approval_status='pending')
    #     return {
    #         "stats": {
    #             "total_users": User.objects.count(),
    #             "total_students": User.objects.filter(role='student').count(),
    #             "total_teachers": User.objects.filter(role='teacher').count(),
    #             "pending_users": UserSerializer(pending_users, many=True).data,
    #         }
    #     }
    
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
