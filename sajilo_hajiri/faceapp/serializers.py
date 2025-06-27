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
        fields = [ 'username', 'email', 'name', 'role', 'roll_number', 'avatar', ]

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

# serializers.py

class TeachingClassSerializer(serializers.Serializer):
    class_name = serializers.CharField()
    subject_name = serializers.CharField()
    students = UserSerializer(many=True)


class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'name', 'role', 'roll_number', 'avatar', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],  # Using email as username
            email=validated_data['email'],
            name=validated_data.get('name'),
            role=validated_data['role'],
            roll_number=validated_data.get('roll_number'),
            avatar=validated_data.get('avatar'),
            password=validated_data['password'],
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class AdminUserReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'approval_status', 'feedback']
        extra_kwargs = {
                    'approval_status': {'required': False},
                    'feedback': {'required': False},
                }

