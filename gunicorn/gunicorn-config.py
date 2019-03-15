import multiprocessing

bind = 'unix:/tmp/gunicorn.sock'
workers = multiprocessing.cpu_count() * 2 + 1
reload = True
daemon = True
accesslog = './log/gunicorn-access.log'
errorlog = './log/gunicorn-error.log'

