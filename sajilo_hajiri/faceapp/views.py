from django.views import View
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from django.contrib.auth import authenticate, login, logout
from .models import *
from .serializers import *
from django.utils.timezone import localtime
from rest_framework.permissions import AllowAny

from .permissions import IsCustomAdmin 

from django.middleware.csrf import get_token

from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

from django.views.decorators.csrf import csrf_protect

from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_bytes

from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView


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
    
class UpdatePendingUserInfoView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # Support file uploads (avatar)

    def post(self, request):
        user = request.user

        if user.approval_status != 'pending':
            return Response({"error": "Only pending users can update their info."}, status=status.HTTP_403_FORBIDDEN)

        try:
            data = request.data

            user.name = data.get('name', user.name)
            user.email = data.get('email', user.email)
            user.username = data.get('username', user.username)
            user.role = data.get('role', user.role)

            if user.role == 'student':
                user.semester = data.get('semester', user.semester)
                user.section = data.get('section', user.section)
                user.department = data.get('department', user.department)
                user.roll_number = data.get('roll_number', user.roll_number)

            if 'avatar' in request.FILES:
                user.avatar = request.FILES['avatar']

            # Reset approval state and feedback
            user.approval_status = 'pending'
            user.feedback = None

            user.save()

            return Response({'message': '✅ Your information has been updated and sent for review.'})

        except Exception as e:
            print("Update error:", e)
            return Response({'error': 'Something went wrong. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
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
    
User = get_user_model()
    
class ForgotPasswordView(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get("username")

        if not email:
            return Response({'error': 'Email is required'}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User with this email does not exist.'}, status=404)

        # Generate password reset token and uid
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        current_site = get_current_site(request).domain
        reset_path = reverse('reset-password', kwargs={'uidb64': uid, 'token': token})
        reset_url = f"http://{current_site}{reset_path}"

        # Send email
        send_mail(
            subject="Password Reset for Sajilo Hajiri",
            message=f"Hi {user.name},\n\nClick the link below to reset your password:\n{reset_url}\n\nIf you did not request this, please ignore this email.",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({'message': '✅ Password reset link sent to your email.'}, status=200)
    
class VerifyTokenView(APIView):
    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid link"}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            return Response({"message": "Token is valid"})
        else:
            return Response({"error": "Token is invalid or expired"}, status=status.HTTP_400_BAD_REQUEST)


class SetNewPasswordView(APIView):
    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("password")

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)



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
    
class PendingUserSelfView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.approval_status != 'pending':
            return Response({'error': 'Only pending users can access this data.'}, status=403)

        serializer = UserSerializer(user)
        return Response(serializer.data)


@method_decorator(csrf_protect, name='dispatch')
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

@method_decorator(csrf_protect, name='dispatch')
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
class UserListView(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class CreateClassView(APIView):
    permission_classes = [IsCustomAdmin]

    def post(self, request):
        data = request.data
        class_obj = Class.objects.create(
            name=data['name'],
            year=data['year'],
            semester=data['semester'],
            department=data['department']
        )
        return Response({"message": "Class created", "id": class_obj.id}, status=201)

class CreateSubjectView(APIView):
    permission_classes = [IsCustomAdmin]

    def post(self, request):
        data = request.data
        subject = Subject.objects.create(name=data['name'], code=data['code'])
        return Response({"message": "Subject created", "id": subject.id}, status=201)

class AssignTeacherView(APIView):
    permission_classes = [IsCustomAdmin]

    def post(self, request):
        data = request.data
        try:
            teacher = User.objects.get(pk=data['teacher'], role='teacher')
            class_instance = Class.objects.get(pk=data['class_instance'])
            subject = Subject.objects.get(pk=data['subject'])
            class_subject = ClassSubject.objects.create(
                teacher=teacher,
                class_instance=class_instance,
                subject=subject
            )
            return Response({"message": "Teacher assigned", "id": class_subject.id}, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
            
class EnrollStudentView(APIView):
    permission_classes = [IsCustomAdmin]

    def post(self, request):
        data = request.data
        try:
            student = User.objects.get(pk=data['student'], role='student')
            enrolled_class = Class.objects.get(pk=data['enrolled_class'])
            enrollment, created = StudentClassEnrollment.objects.get_or_create(
                student=student,
                enrolled_class=enrolled_class
            )
            if created:
                return Response({"message": "Student enrolled"}, status=201)
            else:
                return Response({"message": "Student already enrolled"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

# Supportive API endpoints to fetch users/classes/subjects
class ListTeachers(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request):
        teachers = User.objects.filter(role='teacher').values('id', 'name')
        return Response(list(teachers))

class ListStudents(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request):
        students = User.objects.filter(role='student').values('id', 'name')
        return Response(list(students))

class ListClasses(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request):
        classes = Class.objects.all().values('id', 'name')
        return Response(list(classes))

class ListSubjects(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request):
        subjects = Subject.objects.all().values('id', 'name')
        return Response(list(subjects))
    
# Class CRUD Operations
class ClassDetailView(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request, pk):
        try:
            class_obj = Class.objects.get(pk=pk)
            serializer = ClassSerializer(class_obj)
            return Response(serializer.data)
        except Class.DoesNotExist:
            return Response({"error": "Class not found"}, status=404)

    def put(self, request, pk):
        try:
            class_obj = Class.objects.get(pk=pk)
            serializer = ClassSerializer(class_obj, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except Class.DoesNotExist:
            return Response({"error": "Class not found"}, status=404)

    def delete(self, request, pk):
        try:
            class_obj = Class.objects.get(pk=pk)
            class_obj.delete()
            return Response({"message": "Class deleted successfully"})
        except Class.DoesNotExist:
            return Response({"error": "Class not found"}, status=404)

# Subject CRUD Operations
class SubjectDetailView(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request, pk):
        try:
            subject = Subject.objects.get(pk=pk)
            serializer = SubjectSerializer(subject)
            return Response(serializer.data)
        except Subject.DoesNotExist:
            return Response({"error": "Subject not found"}, status=404)

    def put(self, request, pk):
        try:
            subject = Subject.objects.get(pk=pk)
            serializer = SubjectSerializer(subject, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except Subject.DoesNotExist:
            return Response({"error": "Subject not found"}, status=404)

    def delete(self, request, pk):
        try:
            subject = Subject.objects.get(pk=pk)
            subject.delete()
            return Response({"message": "Subject deleted successfully"})
        except Subject.DoesNotExist:
            return Response({"error": "Subject not found"}, status=404)

# Assignment CRUD Operations
class AssignmentListView(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request):
        assignments = ClassSubject.objects.all()
        serializer = ClassSubjectSerializer(assignments, many=True)
        return Response(serializer.data)

class AssignmentDetailView(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request, pk):
        try:
            assignment = ClassSubject.objects.get(pk=pk)
            serializer = ClassSubjectSerializer(assignment)
            return Response(serializer.data)
        except ClassSubject.DoesNotExist:
            return Response({"error": "Assignment not found"}, status=404)

    def put(self, request, pk):
        try:
            assignment = ClassSubject.objects.get(pk=pk)
            serializer = ClassSubjectSerializer(assignment, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except ClassSubject.DoesNotExist:
            return Response({"error": "Assignment not found"}, status=404)

    def delete(self, request, pk):
        try:
            assignment = ClassSubject.objects.get(pk=pk)
            assignment.delete()
            return Response({"message": "Assignment deleted successfully"})
        except ClassSubject.DoesNotExist:
            return Response({"error": "Assignment not found"}, status=404)

# Enrollment CRUD Operations
class EnrollmentListView(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request):
        enrollments = StudentClassEnrollment.objects.all()
        serializer = StudentClassEnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)

class EnrollmentDetailView(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request, pk):
        try:
            enrollment = StudentClassEnrollment.objects.get(pk=pk)
            serializer = StudentClassEnrollmentSerializer(enrollment)
            return Response(serializer.data)
        except StudentClassEnrollment.DoesNotExist:
            return Response({"error": "Enrollment not found"}, status=404)

    def delete(self, request, pk):
        try:
            enrollment = StudentClassEnrollment.objects.get(pk=pk)
            enrollment.delete()
            return Response({"message": "Enrollment deleted successfully"})
        except StudentClassEnrollment.DoesNotExist:
            return Response({"error": "Enrollment not found"}, status=404)

# User Management Operations
class UserDetailView(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

    def put(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            if user == request.user:
                return Response({"error": "You cannot delete yourself"}, status=400)
            user.delete()
            return Response({"message": "User deleted successfully"})
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        
class ClassListCreateView(ListCreateAPIView):
    permission_classes = [IsCustomAdmin]
    queryset = Class.objects.all()
    serializer_class = ClassSerializer

class ClassDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsCustomAdmin]
    queryset = Class.objects.all()
    serializer_class = ClassSerializer

class SubjectListCreateView(ListCreateAPIView):
    permission_classes = [IsCustomAdmin]
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class SubjectDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsCustomAdmin]
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class EnrollmentListCreateView(ListCreateAPIView):
    permission_classes = [IsCustomAdmin]
    queryset = StudentClassEnrollment.objects.all()
    serializer_class = StudentClassEnrollmentSerializer

class EnrollmentDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsCustomAdmin]
    queryset = StudentClassEnrollment.objects.all()
    serializer_class = StudentClassEnrollmentSerializer
    
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
