from django.core.management.base import BaseCommand
import os
import json
import face_recognition
from faceapp.models import FaceEncoding

def recognize_face(image_path):
    # Load all known encodings and names from the database
    known_encodings = []
    known_names = []
    for fe in FaceEncoding.objects.select_related('student').all():
        try:
            encoding = json.loads(fe.encoding_data)
            known_encodings.append(encoding)
            known_names.append(fe.student.username)  # Use .name or .roll_number if preferred
        except Exception:
            continue

    # Load and encode the test image
    image = face_recognition.load_image_file(image_path)
    encodings = face_recognition.face_encodings(image)
    if not encodings:
        return "unknown"
    test_encoding = encodings[0]

    # Compare with known encodings
    matches = face_recognition.compare_faces(known_encodings, test_encoding)
    for i, match in enumerate(matches):
        if match:
            return known_names[i]
    return "unknown"

class Command(BaseCommand):
    help = 'Test face recognition accuracy using a labeled test dataset.'

    def add_arguments(self, parser):
        parser.add_argument('--test_dir', type=str, default='test_faces', help='Path to test dataset directory')

    def handle(self, *args, **options):
        test_dir = options['test_dir']
        correct = 0
        total = 0
        results = []

        if not os.path.isdir(test_dir):
            self.stdout.write(self.style.ERROR(f'Test directory not found: {test_dir}'))
            return


        for actual_identity in os.listdir(test_dir):
            person_dir = os.path.join(test_dir, actual_identity)
            if not os.path.isdir(person_dir):
                continue
            for img_file in os.listdir(person_dir):
                img_path = os.path.join(person_dir, img_file)
                predicted_identity = recognize_face(img_path)
                results.append((actual_identity, predicted_identity, img_file))
                if predicted_identity == actual_identity:
                    correct += 1
                total += 1

        accuracy = correct / total if total else 0
        self.stdout.write(self.style.SUCCESS(f'Face Recognition Accuracy: {accuracy:.2%}'))
        # Print misclassified images with filenames
        for actual, predicted, img_file in results:
            if actual != predicted:
                self.stdout.write(f'File: {img_file} | Actual: {actual}, Predicted: {predicted}')
