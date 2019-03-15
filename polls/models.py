# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models


# Create your models here.
class ScriptImports(models.Model):
    scriptImports_list = models.CharField(max_length=500)
    # pub_date = models.DateTimeField('date published')


class DSTask(models.Model):
    scriptImports = models.ForeignKey(ScriptImports, on_delete=models.PROTECT)

    recommedned_DSTask = models.CharField(max_length=200)
    recommedned_DSTask_confidence_score = models.IntegerField(default=0)

    recommended_DSMethod = models.CharField(max_length=200)
    recommedned_DSMethod_confidence_score = models.IntegerField(default=0)

    recommended_DSTechnique = models.CharField(max_length=200)
    recommedned_DSTechnique_confidence_score = models.IntegerField(default=0)

    # mohaded@jangoadmin
