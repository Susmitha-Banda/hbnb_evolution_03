const imageList = null;
api.search.getPhotos({query: "hotel room"}).then(result => imageList = result.response.results);
var count = 0;