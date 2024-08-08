""" objects that handles all default RestFul API actions for Review """
from api.v1 import api_routes
from api.v1.users import users_get
from models.review import Review
from flask import Flask, jsonify, request


@api_routes.route('/reviews', methods=["POST"])
def review_post():
    """ Creates a new Review and returns it """
    return Review.create()

@api_routes.route('/reviews', methods=["GET"])
def review_get():
    """ Gets all Reviews """
    place_id = request.args.get('listing_id')
    if not place_id:
         return Review.all()

    reviews = Review.all().get_json()
    filtered_reviews = [review for review in reviews if review['place_id'] == place_id]
    if filtered_reviews:
        users = users_get().get_json();
        users_dict = {user['id']: user for user in users}
        for review in filtered_reviews:
            user_id = review['user_id']
            review['user'] = users_dict.get(user_id, {})
    return jsonify(filtered_reviews), 200
   

@api_routes.route('/reviews/<review_id>', methods=["GET"])
def review_specific_get(review_id):
    """ Gets a specific Review """
    return Review.specific(review_id)

@api_routes.route('/reviews/<review_id>', methods=["PUT"])
def review_put(review_id):
    """ Updates a specific Review and returns it """
    return Review.update(review_id)
