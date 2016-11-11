from django.shortcuts import render
from django.http import JsonResponse


def index(request):
    return render(request, 'app/index.html')


def datasets(request):
    return JsonResponse({
        'datasets': ['car', 'test', 'transport']
    })


def dataset(request, dataset):
    return JsonResponse({
        'status': 'ok',
        'dataset': {
            'name': dataset,
            'data': [1, 2, 3, 4, 5]
        }
    })
