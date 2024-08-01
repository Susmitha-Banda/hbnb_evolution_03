
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
      const countriesSet = new Set(countries.map(dest => dest.country));
      countriesSet.forEach(country => {
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

  

  <select id="destination-filter-select">
                        <!-- Options will be populated by JavaScript -->
                    </select>