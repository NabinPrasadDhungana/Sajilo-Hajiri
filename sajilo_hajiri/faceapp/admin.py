from django.contrib import admin
from .models import (
    User, Class, Subject, ClassSubject, StudentClassEnrollment,
    AttendanceSession, AttendanceRecord, AttendanceAlert, AttendanceReport,
    FaceEncoding
)

# Register your models here.

admin.site.register(User)
admin.site.register(Class)
admin.site.register(Subject)
admin.site.register(ClassSubject)
admin.site.register(StudentClassEnrollment)
admin.site.register(AttendanceSession)
admin.site.register(AttendanceRecord)
admin.site.register(AttendanceAlert)
admin.site.register(AttendanceReport)
admin.site.register(FaceEncoding)