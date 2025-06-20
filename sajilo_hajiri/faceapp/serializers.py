from rest_framework import serializers
from .models import (
    User, Class, Subject, ClassSubject, StudentClassEnrollment,
    AttendanceSession, AttendanceRecord, AttendanceAlert, AttendanceReport,
    FaceEncoding
)

# Model Serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class ClassSubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassSubject
        fields = '__all__'

class StudentClassEnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentClassEnrollment
        fields = '__all__'

class AttendanceSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceSession
        fields = '__all__'

class AttendanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = '__all__'

class AttendanceAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceAlert
        fields = '__all__'

class AttendanceReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceReport
        fields = '__all__'

class FaceEncodingSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaceEncoding
        fields = '__all__'


# Other Serializers

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'avatar', 'name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            role=validated_data['role'],
            avatar=validated_data.get('avatar'),
            name=validated_data.get('name'),
            password=validated_data['password']
        )
        user.approval_status = 'pending'
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class AdminUserReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'approval_status', 'feedback']
 
