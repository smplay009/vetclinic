# home/views.py
from django.shortcuts import render
from django.http import JsonResponse
from .models import Appointment
from datetime import datetime

def booking_page(request):
    hours = [
        "06", "06:30", "07", "07:30", "08", "08:30",
        "09", "09:30", "10", "10:30", "11"
    ]
    return render(request, 'home/main.html', {'hours': hours})
def appointment_ajax(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        phone = request.POST.get('phone')
        date = request.POST.get('date')
        time = request.POST.get('time')

        if not all([name, phone, date, time]):
            return JsonResponse({'status': 'error', 'error': 'تمام فیلدها الزامی هستند.'})

        try:
            date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            return JsonResponse({'status': 'error', 'error': 'تاریخ نامعتبر است.'})

        count = Appointment.objects.filter(date=date_obj, time=time).count()
        if count >= 2:
            return JsonResponse({'status': 'error', 'error': 'ظرفیت این ساعت پر شده.'})

        Appointment.objects.create(name=name, phone=phone, date=date_obj, time=time)
        return JsonResponse({'status': 'ok'})

    return JsonResponse({'status': 'error', 'error': 'درخواست نامعتبر است.'})

def check_slots(request):
    date = request.GET.get('date')
    data = {}
    if date:
        appointments = Appointment.objects.filter(date=date)
        for appt in appointments:
            key = str(appt.time)
            data[key] = data.get(key, 0) + 1
    return JsonResponse(data)
