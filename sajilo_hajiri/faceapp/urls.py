from django.urls import path
from .views import *
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('attendance/session/open/', GetOpenAttendanceSessionView.as_view(), name='get-open-attendance-session'),
    path('register/', RegisterUserView.as_view(), name='register'),
    path('update-info/', UpdatePendingUserInfoView.as_view(), name='update_user_info'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/<uidb64>/<token>/', VerifyTokenView.as_view(), name='reset-password'),
    path('pending-self-info/', PendingUserSelfView.as_view(), name='pending_user_self_info'),
    path('admin/stats/', AdminStatsAPIView.as_view(), name='admin-stats'),
    path('admin/pending-users/', PendingUsersAPIView.as_view(), name='pending-users'),
    path('admin/approve-user/', UserApprovalAPIView.as_view(), name='approve-user'),
    path('admin/send-feedback/', SendFeedbackAPIView.as_view(), name='send-feedback'),    
    path('dashboard/', DashboardAPIView.as_view(), name='dashboard'),
    path('csrf/', CSRFTokenView.as_view(), name='csrf'),
    path('attendance/student/', StudentAttendanceView.as_view(), name='student-attendance'),
    path('verify-token/', VerifyTokenView.as_view(), name='verify-reset-token'),
    path('attendance/session/create/', CreateAttendanceSessionView.as_view(), name='create-attendance-session'),
    path('attendance/recognize/', AttendanceFaceRecognitionView.as_view(), name='attendance-face-recognition'),
    path('attendance/manual/', ManualAttendanceView.as_view(), name='manual-attendance'),
    path('set-password/', SetNewPasswordView.as_view(), name='set-new-password'),
    path('admin/create-class/', CreateClassView.as_view(), name='create-class'),
    path('admin/create-subject/', CreateSubjectView.as_view(), name='create-subject'),
    path('admin/assign-teacher/', AssignTeacherView.as_view(), name='assign-teacher'),
    path('admin/enroll-student/', EnrollStudentView.as_view(), name='enroll-student'),
    path('classes/', ClassListCreateView.as_view(), name='class-list'),
    path('classes/<int:pk>/', ClassDetailView.as_view(), name='class-detail'),
    path('subjects/', SubjectListCreateView.as_view(), name='subject-list'),
    path('subjects/<int:pk>/', SubjectDetailView.as_view(), name='subject-detail'),
    path('teachers/', ListTeachers.as_view(), name='list-teachers'),
    path('students/', ListStudents.as_view(), name='list-students'),
    # Class URLs
    path('classes/<int:pk>/', ClassDetailView.as_view(), name='class-detail'),
    
    # Subject URLs
    path('subjects/<int:pk>/', SubjectDetailView.as_view(), name='subject-detail'),
    
    # Assignment URLs
    path('assignments/', AssignmentListView.as_view(), name='assignment-list'),
    path('assignments/<int:pk>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    
    # Enrollment URLs
    path('enrollments/', EnrollmentListCreateView.as_view(), name='enrollment-list'),
    path('enrollments/<int:pk>/', EnrollmentDetailView.as_view(), name='enrollment-detail'),
    
    # User URLs
    path('admin/users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
]
