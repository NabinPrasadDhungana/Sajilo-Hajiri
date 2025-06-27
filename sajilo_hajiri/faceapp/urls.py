from django.urls import path
from .views import RegisterUserView, LoginView, AdminReviewUserView, DashboardAPIView, CSRFTokenView, StudentAttendanceView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('admin/review/<int:user_id>/', AdminReviewUserView.as_view(), name='admin-review'),
    path('dashboard/', DashboardAPIView.as_view(), name='dashboard'),
    path('csrf/', CSRFTokenView.as_view(), name='csrf'),
    path('attendance/student/', StudentAttendanceView.as_view(), name='student-attendance'),
    

]
