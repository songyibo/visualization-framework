from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist
from app.models import *
import json
import csv


def index(request):
    return render(request, 'app/index.html')


def datasets(request):
    datasets = Dataset.objects.all()
    return JsonResponse({
        'datasets': [dataset.name for dataset in datasets]
    })


def dataset(request, dataset):
    try:
        ds = Dataset.objects.get(name=dataset)
    except ObjectDoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': 'Dataset does not exist.',
            'dataset': {}
        })
    except MultipleObjectsReturned:
        return JsonResponse({
            'status': 'error',
            'message': 'Server internal error.',
            'dataset': {}
        })

    if ds.type == Dataset.TABULAR:
        all_columns = ds.field_set.all()
        columns = [{'name': column.name, 'type': column.type} for column in all_columns]

        with open(ds.file.path) as infile:
            reader = csv.DictReader(infile)
            data = [row for row in reader]

        return JsonResponse({
            'status': 'ok',
            'dataset': {
                'name': ds.name,
                'type': 'csv',
                'columns': columns,
                'data': {
                    'root': data
                }
            }
        })
    else:
        with open(ds.file.path) as infile:
            data = json.load(infile)
        return JsonResponse({
            'status': 'ok',
            'dataset': {
                'name': ds.name,
                'type': 'json',
                'data': data
            }
        })
