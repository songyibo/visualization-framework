from django.shortcuts import render
from django.http import JsonResponse
import json


def index(request):
    return render(request, 'app/index.html')


def datasets(request):
    return JsonResponse({
        'datasets': ['car', 'test', 'transport']
    })
