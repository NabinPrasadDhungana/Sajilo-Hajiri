# signals.py

import face_recognition
import json
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, FaceEncoding

@receiver(post_save, sender=User)
def encode_student_face(sender, instance, created, **kwargs):
    if not (instance.role == 'student' and 
            instance.approval_status == 'approved' and 
            instance.avatar and 
            not FaceEncoding.objects.filter(student=instance).exists()):
        return

    try:
        # Use context manager for safe file handling
        with instance.avatar.open(mode='rb') as image_file:
            image = face_recognition.load_image_file(image_file)
            encodings = face_recognition.face_encodings(image)
        
        if encodings:
            encoding_data = json.dumps(encodings[0].tolist())
            FaceEncoding.objects.create(student=instance, encoding_data=encoding_data)
            print(f"Face encoding saved for {instance.username}")
        else:
            print(f"No face found for {instance.username}")
            
    except FileNotFoundError:
        print(f"Avatar file missing for {instance.username}")
    except Exception as e:
        print(f"Error processing face for {instance.username}: {str(e)}")
