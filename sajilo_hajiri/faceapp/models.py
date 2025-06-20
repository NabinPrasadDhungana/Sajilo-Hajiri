from django.db import models
from django.contrib.auth.models import AbstractUser

# Custom User model
class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    ]
    APPROVAL_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('unapproved', 'Unapproved'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    name = models.CharField(max_length=150, blank=True, null=True)
    roll_number = models.CharField(max_length=10, unique=True, null=True, blank=True)
    approval_status = models.CharField(max_length=15, choices=APPROVAL_CHOICES, default='pending')
    feedback = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name or self.username


class Class(models.Model):
    name = models.CharField(max_length=100)
    year = models.IntegerField()
    semester = models.IntegerField()
    department = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - Sem {self.semester}"


class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


class ClassSubject(models.Model):
    class_instance = models.ForeignKey(Class, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'teacher'})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.class_instance.name} - {self.subject.code}"


class StudentClassEnrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    enrolled_class = models.ForeignKey(Class, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('enrolled_class', 'student')

    def __str__(self):
        return f"{self.student.name} - {self.enrolled_class.name} (Roll: {self.student.roll_number})"



class FaceEncoding(models.Model):
    student = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    encoding_data = models.TextField()  # Store as base64 or JSON string
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Face data for {self.student.username}"


class AttendanceSession(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed'),
    ]
    class_subject = models.ForeignKey(ClassSubject, on_delete=models.CASCADE)
    date = models.DateField()
    started_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, limit_choices_to={'role': 'teacher'})
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    is_manual_allowed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session for {self.class_subject} on {self.date}"


class AttendanceRecord(models.Model):
    ENTRY_STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('manual-present', 'Manual Present'),
    ]
    EXIT_STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('manual-exit', 'Manual Exit'),
    ]
    METHOD_CHOICES = [
        ('facial', 'Facial'),
        ('manual', 'Manual'),
    ]

    attendance_session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    entry_status = models.CharField(max_length=20, choices=ENTRY_STATUS_CHOICES)
    entry_method = models.CharField(max_length=10, choices=METHOD_CHOICES)
    entry_time = models.DateTimeField(null=True, blank=True)
    exit_status = models.CharField(max_length=20, choices=EXIT_STATUS_CHOICES, null=True, blank=True)
    exit_method = models.CharField(max_length=10, choices=METHOD_CHOICES, null=True, blank=True)
    exit_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Record for {self.student.username} - {self.attendance_session}"


class AttendanceAlert(models.Model):
    ALERT_TYPE_CHOICES = [
        ('late_entry', 'Late Entry'),
        ('early_exit', 'Early Exit'),
        ('missing_exit', 'Missing Exit'),
    ]
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    attendance_record = models.ForeignKey(AttendanceRecord, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=ALERT_TYPE_CHOICES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Alert for {self.student.username} - {self.type}"


class AttendanceReport(models.Model):
    REPORT_TYPE_CHOICES = [
        ('individual', 'Individual'),
        ('class', 'Class'),
        ('subject', 'Subject'),
    ]
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    student = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='report_student')
    class_subject = models.ForeignKey(ClassSubject, null=True, blank=True, on_delete=models.SET_NULL)
    from_date = models.DateField()
    to_date = models.DateField()
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.report_type} report from {self.from_date} to {self.to_date}"
