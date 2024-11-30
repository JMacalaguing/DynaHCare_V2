from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FormViewSet, ResponseViewSet, SubmitFormResponse

# Create a router and register the viewsets
router = DefaultRouter()
router.register(r'forms', FormViewSet, basename='form')
router.register(r'responses', ResponseViewSet, basename='response')

# Define the URL patterns for the app
urlpatterns = [
    path('api/', include(router.urls)),  # API endpoints for formbuilder
    path('api/forms/<int:form_id>/submit/', SubmitFormResponse.as_view(), name='submit_form'),
]
