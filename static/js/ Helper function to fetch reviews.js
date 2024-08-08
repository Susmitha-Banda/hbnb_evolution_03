// Helper function to fetch reviews
    fetchReviews: async function (listingId) {
        try {
            const response = await fetch(`/api/v1/reviews?listing_id=${listingId}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }
    },


    // Show details in a modal or new section
    showDetails: function (id) {
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
                    const amenitiesList = amenities.map(amenity => amenity.name).join(', ');
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
                            <h3>${review.author}</h3>
                            <p>${review.content}</p>
                        `;
                            reviewsContainer.appendChild(reviewElement);
                        });
                    } else {
                        reviewsContainer.innerText = 'No reviews available';
                    }
                });

            });

            // Display the modal
            modal.style.display = 'block';
        }

    },

    // Close the modal
    closeModal: function () {
        const modal = document.getElementById('listing-modal');
        modal.style.display = 'none';
    },