# home/views.py
from django.shortcuts import render
from django.http import JsonResponse
from .models import *
from datetime import datetime
from django.shortcuts import render, get_object_or_404
import jdatetime
from django.db.models import Case, When, Value, IntegerField

def booking_page(request):
    hours = [
        "06", "06:30", "07", "07:30", "08", "08:30",
        "09", "09:30", "10", "10:30", "11"
    ]
    blogs = Blog.objects.all().order_by('-updated_date')
    return render(request, 'home/main.html', {
        'hours': hours,
        'blogs': blogs
    })
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


def blog_detail(request, slug):
    blog = get_object_or_404(Blog, slug=slug)
    
    # تبدیل به تاریخ شمسی فقط (بدون زمان)
    jalali_date = jdatetime.datetime.fromgregorian(datetime=blog.updated_date).strftime('%Y/%m/%d')

    return render(request, 'home/blog_detail.html', {
        'blog': blog,
        'jalali_date': jalali_date
    })


def category_detail(request, slug):
    category = get_object_or_404(Category, slug=slug)

    features_raw = category.features.all()

    def normalize(f):
        val = f.order

        # هر مقدار None، صفر، منفی، یا غیرعددی → بفرست آخر
        if not val or val <= 0:
            return 9999
        
        return val

    features = sorted(features_raw, key=lambda f: normalize(f))

    # Debug
    print("======= NORMALIZED ORDER =======")
    for f in features:
        print(f"{normalize(f)} → {f.title}")
    print("================================")

    return render(request, "home/category_detail.html", {
        "category": category,
        "features": features,
    })