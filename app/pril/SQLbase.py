from flaskext.mysql import MySQL
from pril import app
from timeit import default_timer as timer
import redis, json

mysql = MySQL()

mysql.init_app(app)
redis_connect = redis.StrictRedis(host=app.config.get('redis_host'),port=app.config.get('redis_port'),db=app.config.get('redis_db'),password=app.config.get('redis_password'))


def hashing(ip,vendor):
    s = ip + vendor
    hash_string = hash(s)
    return hash_string


def redis_data_output(ip, vendor):
        request_rows = []
        header = []
        redis_array = []

        redis_string_json = redis_connect.get(hashing(ip, vendor))

        if redis_string_json:
                redis_array = json.loads(redis_string_json)
        if len(redis_array) > 0:
                header = redis_array[0]
                request_rows = redis_array[1]
        return request_rows, header


def redis_data_input(request_rows, header, ip, vendor):
        redis_array = (header, request_rows)
        redis_connect.set(hashing(ip, vendor), json.dumps(redis_array))

        print ('base update')

        pass


def request_SQL(ip, vendor):

        request_rows = []
        header = []

        request_rows, header = redis_data_output(ip, vendor)

        start = timer()

        if len(header) == 0 :

                cursor = mysql.connect().cursor()



                config_sql = app.config.get('sql')

                if vendor in config_sql:
                        cursor.execute(config_sql[vendor] %ip)
                        request_rows =cursor.fetchall()

                else:
                        request_rows = []

                cursor.close()



                desc = cursor.description

                for row in desc:
                        header.append(row[0])
                header = tuple(header)
                redis_data_input(request_rows, header, ip, vendor)
        stop = timer() - start

        return request_rows, stop, header
