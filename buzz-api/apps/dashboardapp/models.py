from django.db import models

# Create your models here.
STATUS_CHOICES = (
    ("incomp","INCOMPLETE"),
    ("comp", "COMPLETE"),
)

class ToDoList(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    todo_name = models.CharField(max_length=255)
    todo_description = models.TextField()
    status = models.CharField(max_length=30,choices=STATUS_CHOICES, default="incomp")
    
    class Meta:
        verbose_name = "ToDoList"
        verbose_name_plural = "ToDoList"
        
    def __str__(self):
        return self.todo_name
