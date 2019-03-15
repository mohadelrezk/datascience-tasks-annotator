from __future__ import unicode_literals
from django.shortcuts import render, HttpResponse
from django.shortcuts import render_to_response
from django.views.decorators.csrf import csrf_exempt

# your config file ur_config.py
from .ur_config import host, port, db, collection_questions_responses, collection_users


def load_survey(request):
    return render(request, 'polls/ds_survey.html')


def load_footer(request):
    return render_to_response('polls/footer.html')


@csrf_exempt
def submit_vote_to_db(request):
    response = {'success': False}
    import json
    if request.is_ajax():
        if request.method == 'POST':
            print request.body
            response['success'] = True
            jbody = json.loads(request.body)
            print jbody

            # sanitze the vote object before using it in the mongo update() function
            from mongosanitizer.sanitizer import sanitize
            sanitize(jbody)

            # hash/encrypt the voter id before using it in the mongo update() functions
            import hashlib
            email = str(jbody['voter_id'])
            hashed_email_object = hashlib.md5(email.encode())
            jbody['voter_id'] = hashed_email_object.hexdigest()




            # add vote to mongdb
            from mongo import Mongo
            mongo = Mongo()
            collection_q = mongo.connect(host, port, db, collection_questions_responses)
            query = {}
            #  relaease this to append the vote to its correct concept
            query['ConceptId'] = jbody['concept_id'] #1
            push = {}
            push['$push'] = {}
            push['$push']['votes'] = jbody
            collection_q.update(
                query,
                push
            )

            # add voted tasks to users collections
            collection_u = mongo.connect(host, port, db, collection_users)
            query_ = {}
            query_['UserID'] = jbody['voter_id']
            push_set = {}
            push_set['$push'] = {}
            push_set['$push']['voted_concepts_list'] = jbody['concept_id']
            push_set['$push']['voted_cursor_list'] = jbody['voter_survey_cursor']
            push_set['$push']['voting_dates'] = jbody['vote_date']
            push_set['$set'] = {}
            push_set['$set']['last_vote_date'] = jbody['vote_date']

            collection_u.update(
                query_,
                push_set,
                upsert=True
            )

    from django.http import JsonResponse
    print JsonResponse(response)
    return HttpResponse(json.dumps(response), content_type="application/json")


def get_data_from_mongodb(request):
    from mongo import Mongo
    import copy, json
    print 'connecting to mongodb . . . '
    mongo = Mongo()
    # get all data 188 concepts and their votes
    # mongo.getfromMongo(collection = '', query = '')
    # mongo.appendDataListToMongo(host=mongo_host, port=mongo_port, dbName=mongo_db,
    #                                  collectionName=datasets_collection, Item_JsonObject=dataset_object,
    #                                  id_field=id_field)
    collection = mongo.connect(host, port, db, collection_questions_responses)
    cursor = collection.find(no_cursor_timeout=True)
    response = {}
    # response['prev_tasks'] = []
    response['concepts'] = []
    concept = {}
    for item in cursor:
        # response['prev_tasks'].extend(copy.deepcopy(concept['votes']['voted_tasks']))
        concept['id'] = copy.deepcopy(item['ConceptId'])
        concept['imports'] = copy.deepcopy(item['attributes'])
        response['concepts'].append(copy.deepcopy(concept))
        concept.clear()

    from django.http import JsonResponse
    print JsonResponse(response)
    return HttpResponse(json.dumps(response), content_type="application/json")


# get real tasks
def get_tasks_from_mongodb(request):
    from mongo import Mongo
    import copy, json
    print 'connecting to mongodb . . . '
    mongo = Mongo()
    # get all data 188 concepts and their votes
    # mongo.getfromMongo(collection = '', query = '')
    # mongo.appendDataListToMongo(host=mongo_host, port=mongo_port, dbName=mongo_db,
    #                                  collectionName=datasets_collection, Item_JsonObject=dataset_object,
    #                                  id_field=id_field)
    collection = mongo.connect(host, port, db, collection_questions_responses)
    # get non embty votes only
    query = {}
    query["votes"] = {
        u"$exists": True,
        u"$not": {
            u"$size": 0.0
        }
    }
    cursor = collection.find(query, no_cursor_timeout=True)
    # add your own taska from your ref.csv before loading new tasks from survey results
    prev_tasks = []
    # removed to prevent bias
    # preprepared_tasks = get_tasks_dic()
    # prev_tasks.extend(preprepared_tasks)

    for item in cursor:
        # response['prev_tasks'].extend(copy.deepcopy(concept['votes']['voted_tasks']))
        print item['ConceptId']
        # loop in votes
        for vote in item['votes']:
            if vote:
                # print vote
                prev_tasks.extend(copy.deepcopy(vote['vote_tasks']))  # ['attributes']))

    # from django.http import JsonResponse
    # print JsonResponse(prev_tasks)
    # return JsonResponse(prev_tasks, safe=False)
    return HttpResponse(json.dumps(prev_tasks), content_type="application/json")


def get_tasks_dic():
    #     read json

    import json
    with open('data/ref.json') as f:
        ref_dic = json.load(f)

    # return ref_dic
    # print ref_dic['task']

    # ref_dic = get_tasks_dic()
    agregate = []
    agregate.extend(ref_dic['method'])
    agregate.extend(ref_dic['2nd child task'])
    agregate.extend(ref_dic['1st child task'])
    agregate.extend(ref_dic['task'])
    agregate.extend(ref_dic['miguels tasks'])
    unique = list(set(agregate))
    # remove none
    unique.remove('None');
    print json.dumps(unique)
    return unique


# get voted tasks of a user
def get_voted_tasks_from_mongodb(request, userid):
    from mongo import Mongo
    import copy, json
    print 'connecting to mongodb . . . '

    jresponse = {}
    # response['prev_tasks'] = []
    jresponse['voted_tasks_concepts'] = []
    jresponse['voted_tasks_cursors'] = []

    mongo = Mongo()
    collection = mongo.connect(host, port, db, collection_users)
    query = {}

    #  sanitze the userid before using it in the mongo find() function
    from mongosanitizer.sanitizer import sanitize
    sanitize(userid)

    # hash/encrypt user_id email before querying db to find match
    import hashlib
    email = userid
    hashed_email_object = hashlib.md5(email.encode())


    # prepare query
    query['UserID'] = hashed_email_object.hexdigest()
    cursor = collection.find(query, no_cursor_timeout=True)
    voted_tasks_concepts = []
    voted_tasks_cursors = []

    for item in cursor:
        # response['prev_tasks'].extend(copy.deepcopy(concept['votes']['voted_tasks']))
        print item['voted_concepts_list']
        print item['voted_cursor_list']
        jresponse['voted_tasks_concepts'].extend(copy.deepcopy(item['voted_concepts_list']))
        jresponse['voted_tasks_cursors'].extend(copy.deepcopy(item['voted_cursor_list']))

    # from django.http import JsonResponse
    # print response(JsonResponse(jresponse))
    # return response(JsonResponse(jresponse))
    response = HttpResponse(json.dumps(jresponse), content_type="application/json")
    # cookies set
    if not request.COOKIES.get('userid'):
        # response = HttpResponse()
        response.set_cookie('userid', userid, 3600 * 24 * 365)  # one year cookie
        # return response
    elif request.COOKIES.get('userid') != userid:
        response.set_cookie('userid', userid, 3600 * 24 * 365)  # one year cookie

    return response

# get_data_from_mongodb('')
# get_tasks_dic()
# get_tasks_from_mongodb(request='')

