from requests import Response
from rest_framework import viewsets, status
from rest_framework.response import Response as DRFResponse  # Alias to avoid conflict with Response model
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from .models import Form, FormResponse, Template
from .serializers import FormResponseSerializer, FormSerializer, TemplateSerializer


class TemplateViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer

    @action(detail=True, methods=["get"], permission_classes=[AllowAny])
    def forms(self, request, pk=None):
        """
        Custom action to retrieve all forms for a specific template.
        """
        try:
            template = Template.objects.get(pk=pk)
            forms = template.forms.all()  # Get all forms related to this template
            form_serializer = FormSerializer(forms, many=True)
            return DRFResponse(form_serializer.data, status=status.HTTP_200_OK)
        except Template.DoesNotExist:
            return DRFResponse(
                {"message": "Template not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class FormViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Form.objects.all()
    serializer_class = FormSerializer

    def update(self, request, *args, **kwargs):
        form = self.get_object()
        serializer = self.get_serializer(form, data=request.data, partial=True)  # Partial update

        if serializer.is_valid():
            serializer.save()
            return DRFResponse(serializer.data, status=status.HTTP_200_OK)
        return DRFResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @action(detail=True, methods=["put"], permission_classes=[AllowAny])
    def update_status(self, request, pk=None):
        try:
            form = self.get_object()
            new_status = request.data.get('status')

            # Ensure that the status is valid
            if new_status not in ["In Progress", "Under Review", "Completed", "Not Started"]:
                return DRFResponse({"message": "Invalid status value"}, status=status.HTTP_400_BAD_REQUEST)

            form.status = new_status
            form.save()
            serializer = self.get_serializer(form)

            return DRFResponse(serializer.data, status=status.HTTP_200_OK)
        except Form.DoesNotExist:
            return DRFResponse({"message": "Form not found"}, status=status.HTTP_404_NOT_FOUND)


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

    @action(detail=True, methods=["post"], permission_classes=[AllowAny])
    def clear_responses(self, request, pk=None):
        try:
            form = Form.objects.get(pk=pk)
            form.form_responses.all().delete()  # Use form_responses as the related name
            return DRFResponse({"message": "All responses have been cleared."}, status=status.HTTP_200_OK)
        except Form.DoesNotExist:
            return DRFResponse({"message": "Form not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return DRFResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
        # Action to update response data for a specific form response
    @action(detail=True, methods=["put"], permission_classes=[AllowAny])
    def update_response_data(self, request, pk=None):
        try:
            response = FormResponse.objects.get(pk=pk)  # Get the response object by primary key (ID)
            new_data = request.data.get("response_data")  # Assuming response_data is in the request payload

            if not new_data:
                return DRFResponse(
                    {"message": "New response data is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Update the response data
            response.response_data = new_data
            response.save()

            # Serialize the updated response and return it
            serializer = self.get_serializer(response)
            return DRFResponse(
                {"message": "Response data updated successfully", "data": serializer.data},
                status=status.HTTP_200_OK,
            )
        except FormResponse.DoesNotExist:
            return DRFResponse(
                {"message": "Response not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return DRFResponse(
                {"message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


from rest_framework.response import Response as DRFResponse
from rest_framework.views import APIView
from rest_framework import status
from .models import Form, FormResponse

class SubmitFormResponse(APIView):
    permission_classes = [AllowAny]

    def post(self, request, form_id):
        try:
            form = Form.objects.get(id=form_id)
            response_data = request.data.get("response_data")
            sender_name = request.data.get("sender", "")  # Get the sender as a string

            if not response_data:
                return DRFResponse(
                    {"message": "Response data is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if form_id == 84:  # Special logic for Immunization form
                immunization_data = response_data.get("Immunization")
                if not immunization_data:
                    return DRFResponse(
                        {"message": "Immunization data is required"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                name = immunization_data.get("Name")
                age = immunization_data.get("Age")
                sex = immunization_data.get("Sex")
                new_vaccine = immunization_data.get("Vaccine")
                new_vaccine_date = immunization_data.get("Date")

                if not (name and age and sex and new_vaccine and new_vaccine_date):
                    return DRFResponse(
                        {"message": "Name, Age, Sex, Vaccine, and Date fields are required"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Check for an existing response with matching Name, Age, and Sex
                existing_response = FormResponse.objects.filter(
                    form=form,
                    response_data__Immunization__Name=name,
                    response_data__Immunization__Age=age,
                    response_data__Immunization__Sex=sex,
                ).first()

                if existing_response:
                    # Extract the existing vaccines
                    current_vaccines = existing_response.response_data["Immunization"].get("Vaccine", [])
                    
                    # Ensure current_vaccines is a list of dicts
                    if not isinstance(current_vaccines, list):
                        current_vaccines = []

                    # Check if the new vaccine already exists
                    vaccine_exists = False
                    for vaccine_entry in current_vaccines:
                        if vaccine_entry.get("name") == new_vaccine:
                            vaccine_exists = True
                            vaccine_entry["date"] = new_vaccine_date  # Update the date if vaccine exists

                    if not vaccine_exists:
                        # Add the new vaccine with its date
                        current_vaccines.append({"name": new_vaccine, "date": new_vaccine_date})

                    # Update the existing response with the new vaccine list
                    immunization_data.pop("Date", None)  # Remove top-level Date field
                    existing_response.response_data["Immunization"]["Vaccine"] = current_vaccines
                    existing_response.save()

                    serializer = FormResponseSerializer(existing_response)
                    return DRFResponse(
                        {"message": "Form response updated successfully", "data": serializer.data},
                        status=status.HTTP_200_OK,
                    )
                else:
                    # Create a new response if no match is found
                    new_vaccine = immunization_data.get("Vaccine")
                    new_vaccine_date = immunization_data.get("Date")

                    # Ensure Vaccine is always a list of objects
                    response_data["Immunization"]["Vaccine"] = [{"name": new_vaccine, "date": new_vaccine_date}]
                    response_data["Immunization"].pop("Date", None)

                    form_response = FormResponse(form=form, response_data=response_data, sender=sender_name)
                    form_response.save()

                    serializer = FormResponseSerializer(form_response)
                    return DRFResponse(
                        {"message": "Form submitted successfully", "data": serializer.data},
                        status=status.HTTP_201_CREATED,
                    )
            else:
                # Default behavior for other forms
                form_response = FormResponse(form=form, response_data=response_data, sender=sender_name)
                form_response.save()

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