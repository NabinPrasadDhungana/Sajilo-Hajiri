# Generated by Django 5.2.2 on 2025-07-01 12:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('faceapp', '0009_attendancereport_report_file_attendancereport_status_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='department',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='section',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='semester',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
    ]
