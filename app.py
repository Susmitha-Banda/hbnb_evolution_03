#!/usr/bin/python3

from flask import Flask, render_template, request, abort, jsonify
from api.v1 import api_routes
from models.city import City
from models.country import Country
from models.place_amenity import Place, Amenity
from models.review import Review
from models.user import User

app = Flask(__name__)
app.register_blueprint(api_routes)

@app.route('/')
def index():
    """ Landing page for the site """
    # you MUST have the 'templates' and 'static' folders

    # Load the data we need before passing it to the template
    countries = Country.all(True)
    amenities = Amenity.all(True)
  

    return render_template('index.html', countries=countries, amenities=amenities)

# This endpoint is meant to handle the data submitted by the 'traditional' form post that I have included in the sample HTML
@app.route('/', methods=["POST"])
def results():
    """ Results page after form post """

    # Evaluate what was submitted from the frontend and return the appropriate results
    if request.form is None:
        abort(400, "No form data submitted")

    formdata = request.form
    # print(formdata)

    searched_destination = formdata.get('destination-radio-group')
    searched_amenities = formdata.get('amenities-radio-group')

    # NOTE: Python flask has a weird way of handling the checkboxes values grouped in an array
    if searched_amenities != "":
        searched_amenities = formdata.getlist('amenities-specific-group[]')

    # Load the data we need before passing it to the template
    countries = Country.all(True)
    amenities = Amenity.all(True)
    country_city_places = Country.places(searched_destination, searched_amenities)
    # print(country_city_places)

    # ??? What is this for? Why are we passing the stuff we selected back to the template???
    selected = {
        "destination": searched_destination,
        "amenities": searched_amenities
    }
    # print(selected)

    return render_template('index.html', countries=countries, amenities=amenities, places=country_city_places, selected=selected)

@app.route('/admin')
def admin():
    """ Admin page """

    # Load the data we need before passing it to the template
    cities = City.all(True)
    countries = Country.all(True)
    places = Place.all(True)
    amenities = Amenity.all(True)
    reviews = Review.all(True)
    users = User.all(True)
    place_amenity = Place.amenities_data()

    return render_template('admin.html',
                           place_amenity=place_amenity,
                           cities=cities,
                           countries=countries,
                           places=places,
                           amenities=amenities,
                           reviews=reviews,
                           users=users)

@app.route('/admin', methods=["POST"])
def admin_post():
    """ Handle the form data posted in the admin page """

    # Evaluate what was submitted from the frontend and return the appropriate results
    if request.form is None:
        abort(400, "No form data submitted")

    formdata = request.form
    submit_data = formdata.to_dict()

    model = ""
    data = {}
    for key in submit_data:
        keys = key.split('-')
        model = keys[0]
        data[keys[1]] = submit_data[key]

    result = 'OK' #default
    if model == 'country':
        result = Country.create_from_form_submit(data)
    elif model == 'pa':
        result = Amenity.create_place_relationship(data)

    if result != 'OK':
        return result

    # Load the data we need before passing it to the template
    cities = City.all(True)
    countries = Country.all(True)
    places = Place.all(True)
    amenities = Amenity.all(True)
    reviews = Review.all(True)
    users = User.all(True)
    place_amenity = Place.amenities_data()

    return render_template('admin.html',
                           place_amenity=place_amenity,
                           cities=cities,
                           countries=countries,
                           places=places,
                           amenities=amenities,
                           reviews=reviews,
                           users=users)

@app.route('/status')
def status():
    """ Return server status """
    return 'OK'

# Set debug=True for the server to auto-reload when there are changes
if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)
