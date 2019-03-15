from django.conf.urls import url

from . import views

urlpatterns = [

    url(r'^ds_survey/$', views.load_survey, name='survey'),
    url(r'^ds_survey/footer/$', views.load_footer, name='get_footer'),
    url(r'^get_data/$', views.get_data_from_mongodb, name='get_data'),
    url(r'^ds_survey/get_tasks/$', views.get_tasks_from_mongodb, name='get_tasks'),
    url(r'^submit_vote/$', views.submit_vote_to_db, name='push_vote'),
    url(r'^user_votes/(?P<userid>[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})/$', views.get_voted_tasks_from_mongodb,
        name='get_voted_tasks'),
]
