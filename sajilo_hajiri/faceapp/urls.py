from django.urls import path
from .views import *
from django.contrib.auth import views as auth_views

urlpatterns = [
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
    path('set-password/', SetNewPasswordView.as_view(), name='set-new-password'),

]
