from django.urls import path
from . import views

urlpatterns = [
    path('', views.booking_page, name='booking_page'),
    path('appointment_ajax/', views.appointment_ajax, name='appointment_ajax'),
    path('check_slots/', views.check_slots, name='check_slots'),
]
