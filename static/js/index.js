// I'm doing things the old-fashioned way.
// Let's start by creating a JS 'object' that will hold all the 'attributes' and 'methods' we need.
// Note that this is not Object Oriented Programming. It's just the way people used to code JS 10+ years ago.
// The JS 'object' is nothing more than an associative array (the proper name for a dictionary in Python)



hbnb = {

    listingsData: [],
    imageList: [],
    filteredPlaces: [],
    fetchPlaces: function() {

        fetch('/api/v1/places')
            .then(response => response.json())
            .then(data => {
                console.log("places:")
                console.log(data);
                hbnb.listingsData = data; // Store the fetched data
                hbnb.filteredPlaces = data;
                hbnb.createPlacesCard(data);
                hbnb.fetchCountries(data); // Fetch and populate countries on initialization
              
            })
            .catch(error => console.error('Error fetching places:', error));
    },

    createPlacesCard: function(data) {
        const lisitngsContainer = document.getElementById('hotel-listings');
        lisitngsContainer.innerHTML = '';
        count = 0;
        data.forEach(place => {
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('data-id', place.id); // Set unique identifier
            card.innerHTML =`
                <img src="${imageList[count].urls.small}" alt="${place.name}" class="card-image">
                <div class="card-content">
                    <h2 class="card-title">${place.name}</h2>
                    <p class="card-description">${place.description}</p>
                    <p class="card-price">$${place.price_per_night} per night</p>
                    <button class="card-button">Find More</button>
                </div>
            `;
            lisitngsContainer.appendChild(card);
            count++;
        });
        // Add click event listeners to all "Find More" buttons
        const buttons = document.querySelectorAll('.card-button');
        buttons.forEach(button => {
            button.addEventListener('click', function(event) {
                const card = event.target.closest('.card');
                const id = card.getAttribute('data-id');
                hbnb.showDetails(id);
            });
        });
    },

    fetchCountries: function(places) {
        fetch('/api/v1/countries')
            .then(response => response.json())
            .then(data => {
                console.log('Countries data:', data); // Debugging line
                hbnb.populateCountryFilter(places, data);
                hbnb.fetchAndPopulateAmenities(); // Fetch and populate amenities filter
            })
            .catch(error => console.error('Error fetching countries:', error));
    },
  
    populateCountryFilter: function(places, countries) {
        const select = document.getElementById('destination-filter-select');
        
        const countriesSet = new Set(countries.map(country => country.name));
        countriesSet.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            select.appendChild(option);
        });
  
        // Add event listener to update displayed destinations
        select.addEventListener('change', function(event) {
            const selectedCountry = event.target.value;
            hbnb.filterPlaces(places, countries.filter(country => country.name == selectedCountry));
        });
    },
  
    filterPlaces: function(places, country) {
        console.log('country selected:');
        console.log(country);
        fetch(`/api/v1/countries/${country[0].code}/cities`)
            .then(response => response.json())
            .then(data => {
                console.log('cities of selected country:');
                console.log(data);
                hbnb.displayDestinations(places, data);
            })
            .catch(error => console.error('Error fetching filtered destinations:', error));
    },
  
    displayDestinations: function(places, filteredCities) {
        const filteredCityIds = filteredCities.map(city => city.id);
        filteredPlaces = places.filter(place => filteredCityIds.includes(place.city_id));
        hbnb.createPlacesCard(filteredPlaces);
    },

    fetchAndPopulateAmenities: function() {
        fetch('/api/v1/amenities')
            .then(response => response.json())
            .then(data => {
                hbnb.populateAmenitiesFilter(data);
            })
            .catch(error => console.error('Error fetching amenities:', error));
    },
    
    populateAmenitiesFilter: function(amenities) {
        const amenitiesSubMenu = document.getElementById("amenities-submenu");
        const amenitiesSelectButton = document.getElementById("btn-specific-amenities-select");
        const okButton = document.getElementById("btn-specific-amenities-ok");
    
        // Show/Hide amenities submenu
        amenitiesSelectButton.addEventListener("click", function() {
            // Toggle visibility of the submenu
            if (amenitiesSubMenu.style.display === "none" || amenitiesSubMenu.style.display === "") {
                amenitiesSubMenu.style.display = "block";
            } else {
                amenitiesSubMenu.style.display = "none";
            }
        });
    
        // Handle OK button in amenities submenu
        okButton.addEventListener("click", function() {
            const selectedAmenities = Array.from(document.querySelectorAll('input[name="amenities-specific-group[]"]:checked'))
                                  .map(checkbox => checkbox.value);
            console.log('selected '+selectedAmenities)
            filteredPlaces = hbnb.filteredPlaces.filter(place => selectedAmenities.includes(place.amenity_ids));
            hbnb.createPlacesCard(filteredPlaces);
            // Hide the submenu when OK is clicked
            amenitiesSubMenu.style.display = "none";
           // filterHotels(); // Optionally call a function to filter results based on selected amenities
        });
    },

    fetchAndDisplayHotelsByAmenities: function(amenities) {
        fetch(`/api/v1/places?amenities=${amenities.join(',')}`)
            .then(response => response.json())
            .then(data => {
                hbnb.listingsData = data; // Store the fetched data
                hbnb.displayHotels(data);
            })
            .catch(error => console.error('Error fetching places:', error));
    },

    // Helper function to fetch amenities
    fetchAmenities: function(listingId) {
        return fetch(`/api/v1/amenities?listing_id=${listingId}`)
            .then(response => response.json())
            .catch(error => {
                console.error('Error fetching amenities:', error);
                return []; // Return an empty array on error
            });
    },


    // Helper function to fetch reviews
    fetchReviews: function(listingId) {
        return fetch(`/api/v1/reviews?listing_id=${listingId}`)
            .then(response => response.json())
            .catch(error => {
                console.error('Error fetching reviews:', error);
                return []; // Return an empty array on error
        });
    },


    // Show details in a modal or new section
    showDetails: function(id) {
        const listing = hbnb.listingsData.find(listing => listing.id == id);
        
        if (listing) {
            // Populate the modal with the listing data
            const modal = document.getElementById('listing-modal');
            modal.querySelector('.modal-image').src = imageList[Math.floor(Math.random() * 10)].urls.small_s3;
            modal.querySelector('.modal-title').innerText = listing.name;
            modal.querySelector('.modal-description').innerText = `About: ${listing.description}`;
            modal.querySelector('.modal-price').innerText = ` Price: $${listing.price_per_night} per night`;

            // Fetch and display amenities
            hbnb.fetchAmenities(id).then(amenities => {
                if (amenities.length > 0) {
                    const amenitiesList = amenities.map(amenity => amenity.amenity_name).join(', ');
                    modal.querySelector('.modal-amenities').innerText = `Amenities: ${amenitiesList}`;
                } else {
                    modal.querySelector('.modal-amenities').innerText = 'No amenities listed';
                }

                 // Fetch and display reviews
                hbnb.fetchReviews(id).then(reviews => {
                    const reviewsContainer = modal.querySelector('.modal-reviews');
                    reviewsContainer.innerHTML = ''; // Clear any previous reviews

                    if (reviews.length > 0) {
                        reviews.forEach(review => {
                            const reviewElement = document.createElement('div');
                            reviewElement.classList.add('review');
                            reviewElement.innerHTML = `
                                <h3>User: ${review.user.first_name} ${review.user.last_name}</h3>
                                <p>Comment: ${review.comment}</p>
                                <p>Rating: ${review.rating}<p>
                            `;
                            reviewsContainer.appendChild(reviewElement);
                        });
                    } else {
                        reviewsContainer.innerText = 'No reviews available';
                    }
                        // Add the "Reviews" heading
                    const reviewsHeading = document.createElement('h2');
                    reviewsHeading.classList.add('modal-title');
                    reviewsHeading.innerText = '';
                    reviewsContainer.insertBefore(reviewsHeading, reviewsContainer.firstChild);
                });
            
            });


            // Display the modal
            modal.style.display = 'block';
        }
       
    },

    // Close the modal
    closeModal: function() {
        const modal = document.getElementById('listing-modal');
        modal.style.display = 'none';
    },

    fetchImagesAndHotels: function(){
       fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent('hotel room')}&client_id=${'Il3LOicE8Ta8_O7bRTR4H1_03lpalJBRnPrVl8llbPo'}`)
        .then(response => response.json())
        .then(data => {
            imageList = data.results;
            console.log(imageList);
            hbnb.fetchPlaces();
        })
        .catch(error => console.error('Error fetching Unsplash images:', error));

        
    },

    loginInit: function() {
        // Get the login button and add an event listener
        let loginButton = document.getElementById("login-button");
        loginButton.addEventListener('click', function() {
            hbnb.showLoginModal();
        });
    
        // Get the submit button inside the modal and add an event listener
        let submitButton = document.getElementById("login-submit");
        submitButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent the form from submitting traditionally
            hbnb.handleLogin();
        });

        // Add an event to close the modal when clicking the close button
        let closeButton = document.getElementById("close-button");
        closeButton.addEventListener('click', function() {
            hbnb.closeLoginModal();
        });
    
        // Optional: Add an event to close the modal if clicking outside of it
        let modal = document.getElementById("login-modal");
        window.addEventListener('click', function(event) {
            if (event.target == modal) {
                hbnb.closeLoginModal();
            }
        });
            // Get the logout button and add an event listener
        let logoutButton = document.getElementById("logout-button");
        logoutButton.addEventListener('click', function() {
            hbnb.handleLogout();
        });
    },

    showLoginModal: function() {
        let modal = document.getElementById("login-modal");
        modal.style.display = 'block';
    },

    closeLoginModal: function() {
        let modal = document.getElementById("login-modal");   
        modal.style.display = 'none';
    },
       
    handleLogin: function() {
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
    
        // Simple validation
        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }
    
        // Simulate a login request (for now, just close the modal)
        // You can replace this with actual authentication logic
        
        alert("Login successful!"); // Replace with your own login logic
        

        // Hide the login button
        let loginButton = document.getElementById("login-button");
        if (loginButton) {
            loginButton.style.display = 'none';
        }
        // Show the logout button
        let logoutButton = document.getElementById("logout-button");
        if (logoutButton) {
            logoutButton.style.display = 'block';
        }

        // Hide the welcome section and show the homepage content
        let welcomeSection = document.getElementById("welcome-section");
        let homepageContent = document.getElementById("homepage-content");

        if (welcomeSection && homepageContent) {
            welcomeSection.style.display = "none";
            homepageContent.style.display = "block";
        } else {
            console.error("Could not find one or more elements.");
        }

        hbnb.closeLoginModal();
    },

    handleLogout: function() {
        // Show the login button
        let loginButton = document.getElementById("login-button");
        if (loginButton) {
            loginButton.style.display = 'block';
        }

            // Hide the logout button
        let logoutButton = document.getElementById("logout-button");
        if (logoutButton) {
            logoutButton.style.display = 'none';
        }

        // Show the welcome section and hide the homepage content
        let welcomeSection = document.getElementById("welcome-section");
        let homepageContent = document.getElementById("homepage-content");

        if (welcomeSection && homepageContent) {
            welcomeSection.style.display = "block";
            homepageContent.style.display = "none";
        } else {
            console.error("Could not find one or more elements.");
        }

        // Optionally clear any stored user data or session
        alert("Logout successful!");
    },
        

    
    
    init: function() {
        hbnb.fetchImagesAndHotels(); // Fetch and display hotels on initialization
        hbnb.loginInit(); // Initialize login functionality
        hbnb.handleLogout();
    }
    
};

window.onload = function() {
    // We add something to the web site to indicate that JS is active
    // otherwise a big scary message will appear
    let body = document.getElementsByTagName("body")[0];
    body.setAttribute("js", "ok");

    hbnb.init();
}

// So I'm pretty sure that you've all noticed that the code above is difficult to maintain.
// Just to access the radio inputs for Amenities, I had to use some crazy long selector string like:
// let amenRadios = document.querySelectorAll("#menu >.contents >.amenities >.choice input[type='radio']");
// What if someone changes the structure of the HTML? Updating the code would be terrifying!
// Think about what you all could do to make the code less annoying to update. Remind me to discuss this.