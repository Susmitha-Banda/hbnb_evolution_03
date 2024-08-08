""" objects that handles all default RestFul API actions for Amenity """
from api.v1 import api_routes
from models.place_amenity import Amenity, Place
from flask import Flask, jsonify, request


@api_routes.route('/amenities', methods=["POST"])
def amenity_post():
    """ Creates a new Amenity and returns it """
    return Amenity.create()

@api_routes.route('/amenities', methods=["GET"])
def amenity_get():
    """ Gets all Amenities """
    place_id = request.args.get('listing_id')
    if not place_id:
        return Amenity.all()
         
    amenities_for_a_place = Place.amenities_data()
    filtered_amenities = [amenities for amenities in amenities_for_a_place if amenities['place_id'] == place_id]
    return jsonify(filtered_amenities), 200

@api_routes.route('/amenities/<amenity_id>', methods=["GET"])
def amenity_specific_get(amenity_id):
    """ Gets a specific Amenity """
    return Amenity.specific(amenity_id)

@api_routes.route('/amenities/<amenity_id>', methods=["PUT"])
def amenity_put(amenity_id):
    """ Updates a specific Amenity and returns it """
    return Amenity.update(amenity_id)
