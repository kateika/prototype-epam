var input = document.getElementById('home');
var map, geocoder, autocomplete, homeMarker, officeMarker, homeLocation, officeLocation;

//Create map with center in Minsk
function initMap() {
  //Use it later to fetch address
  geocoder = new google.maps.Geocoder;

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 53.9056591, lng: 27.5598183},
    zoom: 12
  });
  map.addListener("click", markerHandler);
  
  //This is for autocomplete address
  autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener('place_changed', setHome);
  
  //Create reusable markers
  homeMarker = new google.maps.Marker({position: {lng: 0, lat: 0}, map: map, visible: false, draggable: true});
  homeMarker.addListener("dragend", markerHandler);
  
  officeMarker = new google.maps.Marker({position: {lng: 0, lat: 0}, map: map, visible: false});  
}

//Handle click on map and drag on marker and updates home marker
function markerHandler(event) {
  setHomeLocation(event.latLng);

  geocoder.geocode({'location': homeLocation}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      input.value = results[0].formatted_address;
    } else {
      console.warn("Geocode error", status);
    }
  });
}


//Create object with offices latitude and longitude
var officesSelect = document.getElementById("offices");
var officesOptions = officesSelect.getElementsByTagName("option");
var offices = {};

for(var i = 0; i < officesOptions.length; i++) {
  offices[officesOptions[i].value] = {lat: +officesOptions[i].getAttribute("data-lat"), lng: +officesOptions[i].getAttribute("data-lng")};
}

//Place marker when office was chosen
officesSelect.addEventListener("change", chooseOffice);

function chooseOffice(event) {
  if(officesSelect.value == "") return;
  
  // wrap {lng:, lat:} LatLngLiteral into LatLng class for use in LatLngBounds
  officeLocation = new google.maps.LatLng(offices[officesSelect.value]);
  setMarker(officeMarker, officeLocation);
  
  if(homeLocation) fitBounds();
}


//Get home location from the autocomplete
function setHome() {
  var place = autocomplete.getPlace();
  if(place.geometry == undefined) return;
  setHomeLocation(place.geometry.location);
}

//Remember location, set marker, fit bounds
function setHomeLocation(location) {
  homeLocation = location;
  setMarker(homeMarker, homeLocation);
  if(officeLocation) fitBounds();
}

//Set marker from coordinates object
function setMarker(marker, location) {
  map.setCenter(location);
  map.setZoom(17);
  marker.setVisible(true);
  marker.setPosition(location);
}

//Zoom to fit home and office addresses on the map
function fitBounds() {
  var bounds = new google.maps.LatLngBounds();
  //extend is for recogtize sw and ne coords
  bounds.extend(homeLocation);
  bounds.extend(officeLocation);
  map.fitBounds(bounds);
}

var form = document.getElementsByTagName("form")[0];
form.addEventListener("submit", function() {event.preventDefault()})