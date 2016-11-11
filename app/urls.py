# -*- coding: utf-8 -*-

from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),

    url(r'^datasets/$', views.datasets, name='datasets'),
    url(r'^dataset/(?P<dataset>[\w\-_]+)/$', views.dataset, name='dataset'),
]
