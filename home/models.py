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
    image = models.ImageField()

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    

class Category(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    subtitle = models.CharField(max_length=500, blank=True)
    typewriter_text = models.CharField(max_length=300, blank=True)
    main_image = models.ImageField(blank=True, null=True)
    description = models.TextField()

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class CategoryFeature(models.Model):
    category = models.ForeignKey(Category, related_name="features", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField(blank=True, null=True)  # ← اختیاری

    def __str__(self):
        return f"{self.category.name} - {self.title}"