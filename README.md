# datascience-tasks-annotator
An expert survey on tasks of data science, Can we automate data science?  In the quest for answering this question we are gathering data scientists' expertise and knowledge, for building a model able to help "citizen data scientists" to use data platforms better.


http://dke.datascienceinstitute.ie/ds_survey/




## Requirments

> running mongodb instance

## Install

> virtualenv venv

> source ./venv/bin/activate

> pip install -r requirements.txt

## Config

DScience/ur_config.py
polls/ur_config.py

# Run as django web app

> python manage.py runserver 8000

# Run using nginx-gunicorn as wsgi app

reasoning-data-analytics-survey> gunicorn -c gunicorn/gunicorn-config.py DScieneSurvey.wsgi
