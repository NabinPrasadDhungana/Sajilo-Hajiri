from django.urls import path
from .views import RegisterUserView, LoginView, AdminReviewUserView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('admin/review/<int:user_id>/', AdminReviewUserView.as_view(), name='admin-review'),
]
