var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 53.9056591, lng: 27.5598183},
    zoom: 10
  });
}

var officesSelect = document.getElementById("offices");
var officesOptions = officesSelect.getElementsByTagName("option");
var offices = {};

for(var i = 0; i < officesOptions.length; i++) {
  offices[officesOptions[i].value] = {lat: +officesOptions[i].getAttribute("data-lat"), lng: +officesOptions[i].getAttribute("data-lng")};
}
console.log(offices);



officesSelect.addEventListener("change", chooseOffice);
function chooseOffice(event) {
  if(officesSelect.value == "") return;
  map.setCenter(offices[officesSelect.value]);
  map.setZoom(17);
  new google.maps.Marker({position: offices[officesSelect.value], map: map}); 
}
