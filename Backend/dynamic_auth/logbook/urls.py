from django.urls import path
from . import views

urlpatterns = [
    path('api/logbook/', views.LogEntryCreateView.as_view(), name='logbook_api'),
]
