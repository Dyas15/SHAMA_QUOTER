
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

User = get_user_model()

class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_index=True)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    details = models.JSONField(null=True, blank=True)

    # Campos para GenericForeignKey
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey("content_type", "object_id")

    def __str__(self):
        return f"{self.action} by {self.user.username if self.user else 'Anonymous'} at {self.timestamp}"

