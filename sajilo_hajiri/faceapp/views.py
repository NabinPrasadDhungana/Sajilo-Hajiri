from django.views import View
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import base64
import numpy as np
import face_recognition
from datetime import date, datetime
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from django.contrib.auth import authenticate, login, logout
from .models import *
from .serializers import *
from django.utils.timezone import localtime

from .permissions import IsCustomAdmin 

from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect

from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes

from django.db import transaction
from django.core.files.storage import default_storage

import cv2

User = get_user_model()

# Authentication Views
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
             'user_id': user.id}, 
            status=status.HTTP_201_CREATED
        )

class UpdatePendingUserInfoView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        user = request.user

        if user.approval_status != 'pending':
            return Response({"error": "Only pending users can update their info."}, 
                          status=status.HTTP_403_FORBIDDEN)

        try:
            data = request.data
            fields_to_update = ['name', 'email', 'username', 'role']
            
            for field in fields_to_update:
                if field in data:
                    setattr(user, field, data[field])

            if user.role == 'student':
                student_fields = ['semester', 'section', 'department', 'roll_number']
                for field in student_fields:
                    if field in data:
                        setattr(user, field, data[field])

            if 'avatar' in request.FILES:
                user.avatar = request.FILES['avatar']

            user.approval_status = 'pending'
            user.feedback = None
            user.save()

            return Response({'message': '✅ Your information has been updated and sent for review.'})

        except Exception as e:
            return Response({'error': 'Something went wrong. Please try again later.'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        
        login(request, user)
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data
        })

class CSRFTokenView(APIView):
    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        csrf_token = get_token(request)
        response = JsonResponse({'message': 'CSRF cookie set', 'csrfToken': csrf_token})
        response.set_cookie(
            'csrftoken',
            csrf_token,
            max_age=60 * 60 * 24 * 7,
            httponly=False,
            samesite='Lax',
            secure=request.is_secure()
        )
        return response

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        response = Response({'message': 'Logged out successfully'})
        response.delete_cookie('sessionid')
        return response

# Password Management Views
class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get("username")

        if not email:
            return Response({'error': 'Email is required'}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User with this email does not exist.'}, status=404)

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        current_site = get_current_site(request).domain
        reset_path = reverse('reset-password', kwargs={'uidb64': uid, 'token': token})
        reset_url = f"http://{current_site}{reset_path}"

        send_mail(
            subject="Password Reset for Sajilo Hajiri",
            message=f"Hi {user.name},\n\nClick the link below to reset your password:\n{reset_url}\n\nIf you did not request this, please ignore this email.",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({'message': '✅ Password reset link sent to your email.'}, status=200)

class VerifyTokenView(APIView):
    def post(self, request, uidb64=None, token=None):
        uidb64 = uidb64 or request.data.get("uid")
        token = token or request.data.get("token")

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid link"}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            return Response({"message": "Token is valid"})
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

# Admin Views
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
        action = request.data.get("action")

        if not email or not action:
            return Response(
                {"error": "Both email and action are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                user = User.objects.select_for_update().get(email=email)
                
                if action == "approve":
                    user.approval_status = 'approved'
                    user.feedback = ''
                    user.save()
                    return Response(
                        {"message": "User approved successfully"},
                        status=status.HTTP_200_OK
                    )
                
                elif action == "unapprove":
                    # Delete associated files
                    if user.avatar:
                        default_storage.delete(user.avatar.path)
                    
                    # Delete the user (related objects will delete via CASCADE)
                    user.delete()
                    return Response(
                        {"message": "User unapproved and all data deleted successfully"},
                        status=status.HTTP_200_OK
                    )
                
                else:
                    return Response(
                        {"error": "Invalid action. Use 'approve' or 'unapprove'"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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

# Dashboard View
class DashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
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

            attendance_data = [{
                "id": record.id,
                "subject_name": record.attendance_session.class_subject.subject.name,
                "entry_time": localtime(record.entry_time).isoformat() if record.entry_time else None,
                "exit_time": localtime(record.exit_time).isoformat() if record.exit_time else None,
                "entry_status": record.entry_status,
                "exit_status": record.exit_status,
                "entry_method": record.entry_method,
                "exit_method": record.exit_method,
                "date": record.attendance_session.date.isoformat(),
            } for record in attendance]

            return {
                "class": enrolled_class.name,
                "subjects": SubjectSerializer([cs.subject for cs in class_subjects], many=True).data,
                "attendance": attendance_data,
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
                "id": cs.id,  # Add ClassSubject id for frontend
                "class": cs.class_instance.name,
                "subject": cs.subject.name,
                "students": UserSerializer(students, many=True).data
            })
        return {"teaching": teaching_data}

# Admin Management Views
class CreateClassView(APIView):
    permission_classes = [IsCustomAdmin]

    def post(self, request):
        serializer = ClassSerializer(data=request.data)
        if serializer.is_valid():
            class_obj = serializer.save()
            return Response({"message": "Class created", "id": class_obj.id}, status=201)
        return Response(serializer.errors, status=400)

class CreateSubjectView(APIView):
    permission_classes = [IsCustomAdmin]

    def post(self, request):
        serializer = SubjectSerializer(data=request.data)
        if serializer.is_valid():
            subject = serializer.save()
            return Response({"message": "Subject created", "id": subject.id}, status=201)
        return Response(serializer.errors, status=400)

class AssignTeacherView(APIView):
    permission_classes = [IsCustomAdmin]

    def post(self, request):
        serializer = ClassSubjectSerializer(data=request.data)
        if serializer.is_valid():
            try:
                class_subject = serializer.save()
                return Response({"message": "Teacher assigned", "id": class_subject.id}, status=201)
            except Exception as e:
                return Response({"error": str(e)}, status=400)
        return Response(serializer.errors, status=400)

class EnrollStudentView(APIView):
    permission_classes = [IsCustomAdmin]

    def post(self, request):
        serializer = StudentClassEnrollmentSerializer(data=request.data)
        if serializer.is_valid():
            try:
                enrollment, created = StudentClassEnrollment.objects.get_or_create(
                    student_id=serializer.validated_data['student'].id,
                    enrolled_class_id=serializer.validated_data['enrolled_class'].id
                )
                if created:
                    return Response({"message": "Student enrolled"}, status=201)
                return Response({"message": "Student already enrolled"}, status=200)
            except Exception as e:
                return Response({"error": str(e)}, status=400)
        return Response(serializer.errors, status=400)

# List Views
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

# CRUD Views
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

class AssignmentListView(ListCreateAPIView):
    permission_classes = [IsCustomAdmin]
    queryset = ClassSubject.objects.all()
    serializer_class = ClassSubjectSerializer

class AssignmentDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsCustomAdmin]
    queryset = ClassSubject.objects.all()
    serializer_class = ClassSubjectSerializer

class EnrollmentListCreateView(ListCreateAPIView):
    permission_classes = [IsCustomAdmin]
    queryset = StudentClassEnrollment.objects.all()
    serializer_class = StudentClassEnrollmentSerializer

class EnrollmentDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsCustomAdmin]
    queryset = StudentClassEnrollment.objects.all()
    serializer_class = StudentClassEnrollmentSerializer

class UserListView(APIView):
    permission_classes = [IsCustomAdmin]
    serializer_class = UserSerializer

    def get(self, request):
        users = User.objects.all()
        serializer = self.serializer_class(users, many=True)
        return Response(serializer.data)

class UserDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsCustomAdmin]
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def delete(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            return Response({"error": "You cannot delete yourself"}, status=400)
        return super().delete(request, *args, **kwargs)

# Attendance View
class StudentAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role != 'student':
            return Response({'error': 'Unauthorized access'}, status=status.HTTP_403_FORBIDDEN)

        records = AttendanceRecord.objects.filter(student=user).select_related(
            'attendance_session__class_subject__subject'
        )

        data = [{
            'id': record.id,
            'entry_time': localtime(record.entry_time).isoformat() if record.entry_time else None,
            'entry_status': record.entry_status,
            'entry_method': record.entry_method,
            'exit_time': localtime(record.exit_time).isoformat() if record.exit_time else None,
            'exit_status': record.exit_status,
            'exit_method': record.exit_method,
            'subject_name': record.attendance_session.class_subject.subject.name,
            'date': record.attendance_session.date.isoformat(),
        } for record in records]

        return Response(data, status=status.HTTP_200_OK)
    
# --- Attendance Session Creation (Teacher) ---
class CreateAttendanceSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        class_subject_id = request.data.get('class_subject_id')
        session_title = request.data.get('session_title', None)
        is_manual_allowed = request.data.get('is_manual_allowed', False)

        # Check teacher is assigned to this class_subject
        try:
            class_subject = ClassSubject.objects.get(id=class_subject_id, teacher=user.id)
        except ClassSubject.DoesNotExist:
            return Response({'error': 'You are not assigned to this class/subject.'}, status=403)

        today = date.today()
        # Prevent duplicate open session for same class/subject and date
        if AttendanceSession.objects.filter(class_subject=class_subject, date=today, status='open').exists():
            return Response({'error': 'An open attendance session already exists for today.'}, status=400)

        session = AttendanceSession.objects.create(
            class_subject=class_subject,
            session_title=session_title,
            date=today,
            started_by=user,
            is_manual_allowed=is_manual_allowed,
            status='open',
        )
        return Response({'message': 'Attendance session created.', 'session_id': session.id}, status=201)

# --- Attendance via Face Recognition (Entry/Exit) ---
class AttendanceFaceRecognitionView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        """
        Expects: {
            'session_id': int,
            'images': [base64 strings],
            'mode': 'entry' or 'exit'
        }
        """
        user = request.user
        session_id = request.data.get('session_id')
        images = request.data.get('images', [])
        mode = request.data.get('mode', 'entry')

        # Validate session
        try:
            session = AttendanceSession.objects.get(id=session_id, status='open')
        except AttendanceSession.DoesNotExist:
            return Response({'error': 'Session not found or closed.'}, status=404)

        # Only teacher who started session can mark attendance
        if session.started_by != user:
            return Response({'error': 'You are not authorized for this session.'}, status=403)

        # Get enrolled students and their encodings
        enrollments = StudentClassEnrollment.objects.filter(enrolled_class=session.class_subject.class_instance)
        students = [e.student for e in enrollments]
        encodings = []
        student_ids = []
        for student in students:
            try:
                face_enc = FaceEncoding.objects.get(student=student)
                encoding = np.array(eval(face_enc.encoding_data))
                encodings.append(encoding)
                student_ids.append(student.id)
            except FaceEncoding.DoesNotExist:
                continue

        recognized = []
        for img_b64 in images:
            try:
                img_data = base64.b64decode(img_b64)
                nparr = np.frombuffer(img_data, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
            except Exception:
                continue
            faces = face_recognition.face_encodings(img)
            
            for face in faces:
                matches = face_recognition.compare_faces(encodings, face, tolerance=0.5)
                for idx, match in enumerate(matches):
                    if match:
                        student_id = student_ids[idx]
                        recognized.append(student_id)
        if not recognized:
            return Response({'message': 'No faces recognized.'}, status=200)

        recognized = list(set(recognized))
        now = datetime.now()
        results = []
        for sid in recognized:
            student = User.objects.get(id=sid)
            record, created = AttendanceRecord.objects.get_or_create(
                attendance_session=session,
                student=student,
                defaults={
                    'entry_status': 'present' if mode == 'entry' else 'absent',
                    'entry_method': 'facial',
                    'entry_time': now if mode == 'entry' else None,
                }
            )
            if not created:
                if mode == 'entry' and not record.entry_time:
                    record.entry_status = 'present'
                    record.entry_method = 'facial'
                    record.entry_time = now
                elif mode == 'exit':
                    record.exit_status = 'present'
                    record.exit_method = 'facial'
                    record.exit_time = now
                record.save()
            results.append({
                'student_id': sid,
                'name': student.name,
                'mode': mode,
                'status': 'marked',
            })
        return Response({'recognized': results}, status=200)

# --- Manual Attendance Marking ---
class ManualAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Expects: {
            'session_id': int,
            'student_id': int,
            'mode': 'entry' or 'exit'
        }
        """
        user = request.user
        session_id = request.data.get('session_id')
        student_id = request.data.get('student_id')
        mode = request.data.get('mode', 'entry')

        try:
            session = AttendanceSession.objects.get(id=session_id, status='open')
        except AttendanceSession.DoesNotExist:
            return Response({'error': 'Session not found or closed.'}, status=404)

        if session.started_by != user:
            return Response({'error': 'You are not authorized for this session.'}, status=403)

        try:
            student = User.objects.get(id=student_id, role='student')
        except User.DoesNotExist:
            return Response({'error': 'Student not found.'}, status=404)

        now = datetime.now()
        record, created = AttendanceRecord.objects.get_or_create(
            attendance_session=session,
            student=student,
            defaults={
                'entry_status': 'manual-present' if mode == 'entry' else 'absent',
                'entry_method': 'manual',
                'entry_time': now if mode == 'entry' else None,
            }
        )
        if not created:
            if mode == 'entry' and not record.entry_time:
                record.entry_status = 'manual-present'
                record.entry_method = 'manual'
                record.entry_time = now
            elif mode == 'exit':
                record.exit_status = 'manual-exit'
                record.exit_method = 'manual'
                record.exit_time = now
            record.save()
        return Response({'message': f'Manual {mode} marked for {student.name}.'}, status=200)

# Endpoint to get open attendance session for a class_subject_id (CBV)
class GetOpenAttendanceSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        class_subject_id = request.GET.get('class_subject_id')
        if not class_subject_id:
            return Response({'error': 'class_subject_id is required'}, status=400)
        try:
            session = AttendanceSession.objects.get(class_subject_id=class_subject_id, date=date.today(), status='open')
            return Response({'session_id': session.id})
        except AttendanceSession.DoesNotExist:
            return Response({'session_id': None})