import time
import schedule
from constants import MONGODB_NAME, MONGODB_URL
from pymongo import MongoClient


def get_count_from_aggr(field, mongodb, collection_name):
    res = mongodb[collection_name].find_one(
        field, {"_id": 0, "count": 1}
    )
    return res["count"] if res else 0


def aggr_data_field_wise(pipeline, mongodb, collection_name):
    cursor = mongodb.raw_crime_info.aggregate(pipeline)
    for doc in cursor:
        if(collection_name in mongodb.list_collection_names()):
            count_int_aggr = get_count_from_aggr(
                doc["_id"], mongodb,
                collection_name
            )
            if(count_int_aggr > 0):
                mongodb[collection_name].update_one(
                    {"_id": doc["_id"]},
                    {"$set": {"count": count_int_aggr + doc["count"]}}
                )
            else:
                mongodb[collection_name].insert_one(
                    {"_id": doc["_id"],
                     "count": doc["count"]}
                )
        else:
            mongodb[collection_name].insert_one(
                {"_id": doc["_id"],
                 "count": doc["count"]}
            )


def aggr_data_job():
    mongodb_client = MongoClient(MONGODB_URL)
    mongodb = mongodb_client[MONGODB_NAME]
    end_time = time.time()
    start_time = end_time - 3600
    aggr_fields = ["country", "state", "city", "type"]
    for field in aggr_fields:
        collection_name = "aggr_crime_info_" + field
        pipeline = [
            {"$project": {
                "country": 1, "state": 1, "city": 1, "type": 1, "created_at": 1
                }
             },
            {"$match": {"created_at": {"$gt": start_time, "$lt": end_time}}},
            {"$group": {"_id": "$" + field, "count": {"$sum": 1}}},
        ]
        aggr_data_field_wise(pipeline, mongodb, collection_name)
    mongodb_client.close()


schedule.every().hour.do(aggr_data_job)

while True:
    # Checks whether a scheduled task
    # is pending to run or not
    schedule.run_pending()
    time.sleep(5)
