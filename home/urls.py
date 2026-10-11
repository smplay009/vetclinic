from django.urls import path
from .views import *

urlpatterns = [
    path('', booking_page, name='booking_page'),
    path('appointment_ajax/', appointment_ajax, name='appointment_ajax'),
    path('check_slots/', check_slots, name='check_slots'),
    path('blog/<slug:slug>/', blog_detail, name='blog_detail')

]
