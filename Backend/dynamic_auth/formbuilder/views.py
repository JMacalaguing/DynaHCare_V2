from rest_framework import viewsets, status
from rest_framework.response import Response as DRFResponse  # Alias to avoid conflict with Response model
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from .models import Form, FormResponse
from .serializers import FormResponseSerializer, FormSerializer

class FormViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Form.objects.all()
    serializer_class = FormSerializer


class ResponseViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = FormResponseSerializer

    def get_queryset(self):
        """
        Filter responses by form_id if provided.
        """
        form_id = self.request.query_params.get("form_id")
        if form_id:
            return FormResponse.objects.filter(form_id=form_id)
        return FormResponse.objects.all()

    @action(detail=True, methods=["get"], permission_classes=[AllowAny])
    def for_form(self, request, pk=None):
        """
        Custom action to retrieve all responses for a specific form.
        """
        try:
            responses = FormResponse.objects.filter(form_id=pk)
            serializer = self.get_serializer(responses, many=True)
            return DRFResponse(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return DRFResponse(
                {"message": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )


class SubmitFormResponse(APIView):
    permission_classes = [AllowAny]

    def post(self, request, form_id):
        try:
            form = Form.objects.get(id=form_id)
            response_data = request.data.get("response_data")

            if not response_data:
                return DRFResponse(
                    {"message": "Response data is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Create and save the response
            form_response = FormResponse(form=form, response_data=response_data)
            form_response.save()

            # Serialize and respond
            serializer = FormResponseSerializer(form_response)
            return DRFResponse(
                {"message": "Form submitted successfully", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        except Form.DoesNotExist:
            return DRFResponse(
                {"message": "Form not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return DRFResponse(
                {"message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
