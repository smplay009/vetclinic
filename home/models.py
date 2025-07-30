from django.db import models
from django.utils.text import slugify
class Appointment(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    date = models.DateField()
    time = models.TimeField()

    def __str__(self):
        return f"{self.name} - {self.date} @ {self.time}"



class Blog(models.Model):
    name = models.CharField(max_length=255)
    title = models.TextField()  
    slug = models.SlugField(unique=True, blank=True)

    
    p_des = models.TextField() 
    description = models.TextField() 
    
    created_date = models.DateTimeField(auto_now_add=True) 
    updated_date = models.DateTimeField(auto_now=True) 
    image = models.ImageField(upload_to= 'up')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name