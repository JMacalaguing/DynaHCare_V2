from django.db import models
from django.utils.timezone import now

class LogEntry(models.Model):
    name = models.CharField(max_length=255)
    date = models.DateField(default=now)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.date}"