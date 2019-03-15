
from pymongo import CursorType
from pymongo import MongoClient
from bson import ObjectId

class Mongo:
    global client
    mongoClass = 'mongo class to contain common mongodb queries!'
    client = MongoClient()

    def __init__(self):
        print self.mongoClass

    def connect(slef, host, port, dbName, collectionName):
        try:
            client = MongoClient(host, port)
            db = client[dbName]
            coll = db[collectionName]
            print 'successfully connected to: ' + host + '   ' + str(port) + '   ' + dbName + '   ' + collectionName
            return coll
        except BaseException as exce:
            print str(exce)

        return coll

    def appendItemToMongo(self, host, port, dbName, collectionName, Item_JsonObject, id_field):
        try:
            collection = self.connect(host, port, dbName, collectionName)
            collection.update({'_id': Item_JsonObject[id_field]}, Item_JsonObject, True)
        except BaseException as exc:
            print exc

    appendDataListToMongo = appendItemToMongo

    def appendRelationToMongo(self, collection, JsonObject, id_part_A, id_part_B):
        try:
            _id = JsonObject[id_part_A] + '-_-' + str(JsonObject[id_part_B])
            collection.update({'_id': _id}, JsonObject, True)
        except BaseException as exc:
            print exc
            self.appendRelationToMongo(collection, JsonObject)

    def appendPublishersRelationToMongo(self, collectionobject, JsonObject):
        try:
            _id = JsonObject['publisherA'] + '-_-' + str(JsonObject['publisherB'])
            collection.update({'_id': _id}, JsonObject, True)
        except BaseException as exc:
            print exc
            self.appendRelationToMongo(collection, JsonObject)

    def getfromMongo(self, collection, query):
        try:
            if not query:
                cursor = collection.find(no_cursor_timeout=True)
            else:
                if query:
                    cursor = collection.find(query, no_cursor_timeout=True)
        except BaseException as exc:
            print exc

        return cursor

    def getfromMongoFindone(self, collection, query):
        try:
            if not query:
                cursor = collection.find_one()
            else:
                if query:
                    cursor = collection.find_one(query)
        except BaseException as exc:
            print exc
            self.getfromMongoFindone(collection, query)

        return cursor

    def getdistinctfromMongo(self, collection, field, query):
        try:
            if not query:
                cursor = collection.distinct(field)
            else:
                if query:
                    cursor = collection.distinct(field, query)
        except BaseException as exc:
            print exc
            self.getdistinctfromMongo(collection, field, query)

        return cursor

    def aggregateMongo(self, collection, query):
        try:
            if not query:
                cursor = 'aggregate query shall have query param'
            else:
                if query:
                    cursor = collection.aggregate(query)
        except BaseException as exc:
            print exc
            self.getfromMongo(collection, query)

        return cursor

    def clientClose(self):
        client.close()


if __name__ == '__main__':
    from pymongo import MongoClient
    print 'start'
    connection = MongoClient()
    print connection.address
    db = connection.test
    collection = db.things
    item = collection.find_one()
    print item
# okay decompiling mongo.pyc

