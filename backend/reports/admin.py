from django.contrib import admin
from .models import Category, Report, StatusHistory


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'status', 'priority', 'reported_by', 'created_at')
    list_filter = ('status', 'priority', 'category')
    search_fields = ('title', 'description')


@admin.register(StatusHistory)
class StatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('report', 'old_status', 'new_status', 'changed_by', 'created_at')