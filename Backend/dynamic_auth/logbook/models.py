from django.db import models
from django.utils.timezone import now

class LogEntry(models.Model):
    name = models.CharField(max_length=255)
    date = models.DateField(default=now)
    type_of_consultation = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.date} - {self.type_of_consultation or 'N/A'}"