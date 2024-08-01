// I'm doing things the old-fashioned way.
// Let's start by creating a JS 'object' that will hold all the 'attributes' and 'methods' we need.
// Note that this is not Object Oriented Programming. It's just the way people used to code JS 10+ years ago.
// The JS 'object' is nothing more than an associative array (the proper name for a dictionary in Python)



hbnb = {
    amenitiesInit: function() {
        // set up the onclick events for the Amenities radios + button
        let amenRadios = document.querySelectorAll("#menu >.contents >.amenities >.choice input[type='radio']");
        for (let elem of amenRadios) {
            elem.addEventListener("change", function(e) {
            let specificSelectedText = document.querySelector("#menu >.contents >.amenities >.title .selected")
            
                let radioValue = e.target.value
                if (radioValue == 'specific') {
                    hbnb.showSpecificAmenitiesSubmenu();
                    hbnb.updateSpecificAmenitiesCount();
                    specificSelectedText.setAttribute('state', 'show');
                } else {
                    // all amenities - empty string
                    hbnb.hideSpecificAmenitiesSubmenu()
                    specificSelectedText.setAttribute('state', 'hide')
                }
            });
        }

        let amenSpecificSelectBtn = document.getElementById("btn-specific-amenities-select");
        amenSpecificSelectBtn.addEventListener('click', function() {
            hbnb.showSpecificAmenitiesSubmenu()

            // NOTE: simply clicking the Please Select button won't cause the radio to change
            // The button eats up the click event so the label tag + radio won't receive it.
            // We'll select the radio if it isn't already selected
            if (!amenRadios[1].checked) {
                amenRadios[1].click();
            }
        });

        // For the checkboxes in the submenu, let's add events that will update the counter
        let selectedAmenitiesCheckboxes = document.querySelectorAll("#amenities-submenu >.items input[type='checkbox']");
        for (let c of selectedAmenitiesCheckboxes) {
            c.addEventListener('click', function() {
                hbnb.updateSpecificAmenitiesCount();
            })
        }

        // Last but not least! Now let's add an event to the OK button in the submenu
        // Note that we are just hiding the menu and doing anything anything special
        let amenSpecificConfirmBtn = document.getElementById("btn-specific-amenities-ok");
        amenSpecificConfirmBtn.addEventListener('click', function(){
            hbnb.hideSpecificAmenitiesSubmenu();
        })

    },
    showSpecificAmenitiesSubmenu: function() {
        // I have set up the CSS in a certain way so that the submenu is shown / hidden
        // depending on the 'state' parameter's value in #amenities-submenu
        let submenu = document.querySelector("#amenities-submenu")
        submenu.setAttribute("state", 'show')
    },
    hideSpecificAmenitiesSubmenu: function() {
        let submenu = document.querySelector("#amenities-submenu")
        submenu.setAttribute("state", 'hide')
    },
    updateSpecificAmenitiesCount: function() {
        let specificCount = document.querySelector("#menu >.contents >.amenities >.title .count")
        let selectedAmenitiesCheckboxes = document.querySelectorAll("#amenities-submenu >.items input[type='checkbox']");

        let checkedCount = 0
        for (let c of selectedAmenitiesCheckboxes) {
            if (c.checked) {
                checkedCount++
            }
        }

        specificCount.innerHTML = checkedCount
    },
    listingsData: [],
    fetchAndDisplayHotels: function(imageList) {

        fetch('/api/v1/places')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                hbnb.listingsData = data; // Store the fetched data
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
                hbnb.fetchAndPopulateCountries(); // Fetch and populate countries on initialization
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
            //modal.querySelector('.modal-image').src = listing.image_url; // Assuming you have image_url in your data
            modal.querySelector('.modal-title').innerText = listing.name;
            modal.querySelector('.modal-description').innerText = listing.description;
            modal.querySelector('.modal-price').innerText = `$${listing.price_per_night} per night`;

            // Fetch and display amenities
            hbnb.fetchAmenities(id).then(amenities => {
                if (amenities.length > 0) {
                    const amenitiesList = amenities.map(amenity => amenity.name).join(', ');
                    modal.querySelector('.modal-amenities').innerText = `Amenities: ${amenitiesList}`;
                } else {
                    modal.querySelector('.modal-amenities').innerText = 'No amenities listed';
                }
            });
            
            // Fetch and display reviews
            hbnb.fetchReviews(id).then(reviews => {
                if (reviews.length > 0) {
                    const reviewsContent = reviews.map(review => `<p>${review}</p>`).join('');
                    modal.querySelector('.modal-reviews').innerHTML = `Reviews: ${reviewsContent}`;
                } else {
                    modal.querySelector('.modal-reviews').innerHTML = 'No reviews available';
                }
            });
            // Display the modal
            modal.style.display = 'block';
            console.log('button clicked !!!' + modal)
        }
       
    },

    // Close the modal
    closeModal: function() {
        const modal = document.getElementById('listing-modal');
        modal.style.display = 'none';
    },

    fetchImagesAndHotels: function(){
       let imageList = [];
       fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent('hotel room')}&client_id=${'Il3LOicE8Ta8_O7bRTR4H1_03lpalJBRnPrVl8llbPo'}`)
        .then(response => response.json())
        .then(data => {
            imageList = data.results;
            hbnb.fetchAndDisplayHotels(imageList);
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
        hbnb.closeLoginModal();

    
    },

    fetchAndPopulateCountries: function() {
        fetch('/api/v1/countries')
            .then(response => response.json())
            .then(data => {
                console.log('Countries data:', data); // Debugging line
                hbnb.populateCountryFilter(data);
            })
            .catch(error => console.error('Error fetching countries:', error));
    },
  
    populateCountryFilter: function(countries) {
        const select = document.getElementById('destination-filter-select');
        select.innerHTML = ''; // Clear existing options
  
        // Add "All" option
        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = 'All';
        select.appendChild(allOption);
  
        // Add country options
        
        const countriesSet = new Set(countries.map(country => country.name));
        countriesSet.forEach(country => {
            console.log(country);
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            select.appendChild(option);
        });
  
        // Add event listener to update displayed destinations
        select.addEventListener('change', function(event) {
            const selectedCountry = event.target.value;
            hbnb.filterAndDisplayDestinations(selectedCountry);
        });
    },
  
    filterAndDisplayDestinations: function(country) {
        fetch(`/api/v1/countries?country=${country}`)
            .then(response => response.json())
            .then(data => {
                hbnb.displayDestinations(data);
            })
            .catch(error => console.error('Error fetching filtered destinations:', error));
    },
  
    displayDestinations: function(destinations) {
        const list = document.getElementById('destination-list');
        list.innerHTML = '';
  
        destinations.forEach(destination => {
            const card = document.createElement('div');
            card.className = 'destination-card';
            card.innerHTML = `
                <img src="${destination.image}" alt="${destination.city}">
                <h3>${destination.city}</h3>
                <p>${destination.description}</p>
            `;
            list.appendChild(card);
        });
    },
  


    

    init: function() {
        hbnb.amenitiesInit();
        hbnb.fetchImagesAndHotels(); // Fetch and display hotels on initialization
        hbnb.loginInit(); // Initialize login functionality
        
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