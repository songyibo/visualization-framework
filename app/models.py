from django.db import models


class Dataset(models.Model):
    TABULAR, HIERARCHICAL = 'T', 'H'
    DATASET_TYPE = (
        (TABULAR, 'csv'),
        (HIERARCHICAL, 'json')
    )

    name = models.CharField(max_length=40)
    type = models.CharField(max_length=20, choices=DATASET_TYPE, default=TABULAR)
    file = models.FileField()

    def __str__(self):
        return self.name


class Field(models.Model):
    INTEGER, REAL, STRING = 'int', 'real', 'str'
    FIELD_TYPE = (
        (INTEGER, 'integer'),
        (REAL, 'real'),
        (STRING, 'string')
    )

    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=30)
    type = models.CharField(max_length=20, choices=FIELD_TYPE)
    enumerable = models.BooleanField(default=False)

    def __str__(self):
        return self.name
