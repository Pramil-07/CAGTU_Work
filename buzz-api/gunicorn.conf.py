import multiprocessing

wsgi_app = 'cagtubuzz.wsgi:application'
bind = f'0.0.0.0:8011'

# backlog = 2048


workers = 2 * multiprocessing.cpu_count() + 1
# worker_connections = 1000
timeout = 300
daemon = False
# keepalive = 2

errorlog = '-'
loglevel = 'info'
accesslog = '-'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'
