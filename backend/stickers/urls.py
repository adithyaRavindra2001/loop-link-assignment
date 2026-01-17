from django.urls import path
from . import views

urlpatterns = [
    path('transactions/', views.process_transaction, name='process_transaction'),
    path('shoppers/', views.list_shoppers, name='list_shoppers'),
    path('shoppers/<str:shopper_id>/', views.get_shopper, name='get_shopper'),
    path('stats/', views.get_stats, name='get_stats'),
]
