from django.urls import path
from .views import *

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('update-info/', UpdatePendingUserInfoView.as_view(), name='update_user_info'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('pending-self-info/', PendingUserSelfView.as_view(), name='pending_user_self_info'),
    path('admin/stats/', AdminStatsAPIView.as_view(), name='admin-stats'),
    path('admin/pending-users/', PendingUsersAPIView.as_view(), name='pending-users'),
    path('admin/approve-user/', UserApprovalAPIView.as_view(), name='approve-user'),
    path('admin/send-feedback/', SendFeedbackAPIView.as_view(), name='send-feedback'),    
    path('dashboard/', DashboardAPIView.as_view(), name='dashboard'),
    path('csrf/', CSRFTokenView.as_view(), name='csrf'),
    path('attendance/student/', StudentAttendanceView.as_view(), name='student-attendance'),
    

]
