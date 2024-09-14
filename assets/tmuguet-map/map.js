
// Instantiates Leaflet map and map markers, and connects them to the gpx and 
// images on the page

var Promise = window.Promise || JSZip.external.Promise;
var map = null;

var colorMap = {
  'red': '#bf616a',
  'orange': '#d08770',
  'green': '#a3be8c',
  'blue': '#5e81ac',
  'purple': '#b48ead',
  'darkred': '#A23336',
  'darkblue': '#0067A3',
  'darkgreen': '#728224',
  'darkpurple': '#5B396B',
  'cadetblue': '#436978',
  'lightred': '#FF8E7F',
  'beige': '#FFCB92',
  'lightgreen': '#728224',
  'lightblue': '#88c0d0',
  'orchid': '#b5b9dc',
  'white': '#FBFBFB',
  'lightgray': '#A3A3A3',
  'gray': '#575757',
  'black': '#303030'
};

var colors = [
  'red',
  'orange',
  'green',
  'blue',
  'purple',
  'darkred',
  'darkblue',
  'darkgreen',
  'darkpurple',
  'cadetblue',
  'lightred',
  'beige',
  'lightgreen',
  'lightblue',
  'orchid',
  'white',
  'lightgray',
  'gray',
  'black',
]

var currentColor = 0;
var bounds = null;

var iconDefault = L.AwesomeMarkers.icon({
  icon: 'camera',
  markerColor: 'gray',
  prefix: 'fa'
});

var iconSelected = L.AwesomeMarkers.icon({
  icon: 'camera',
  markerColor: 'purple',
  prefix: 'fa'
});

var iconsMap = {};

// Instantiate map 
// This is tmuguet's API key until I figure out how to implement secrets
// on my public site repo and I can use my own
function initMap() {
  if ($("#mapid").length === 0) return;

  map = L.map('mapid');

  L.tileLayer(
    'https://tile.thunderforest.com/atlas/{z}/{x}/{y}{r}.png?apikey=bcecc6dc7a9a46cca6d1eff04dd595cf',
    {
      maxZoom: 18,
    }
  ).addTo(map);
}

function nextColor() {
  currentColor = (currentColor + 1) % colors.length;
  return currentColor;
}

// Draw route from GPX
function showTrack(track, color) {
  var start = null;
  var end = null;
  var featuregroup = L.featureGroup();

  if (!(color in iconsMap)) {
    iconsMap[color] = L.AwesomeMarkers.icon({
      icon: 'location-arrow',
      markerColor: color,
      prefix: 'fa'
    });
  }

  var line = new L.geoJSON(track);
  var layers = line.getLayers();
  for (let i = 0; i < layers.length; i += 1) {
    if (layers[i] instanceof L.Polyline && layers[i].feature.geometry.type === 'LineString') {
      layers[i].setStyle({ weight: 5, color: colorMap[color], opacity: 0.7 });
      layers[i].addTo(featuregroup);

      var latlngs = layers[i].getLatLngs();
      
      if (start === null) {
        start = latlngs[0];
        L.marker(start, {
          icon: iconsMap[color]
        }).addTo(featuregroup);
      }
      end = latlngs[latlngs.length - 1];
    } /*
    Not sure we want to display other features
    else if (layers[i] instanceof L.Path) {
      // Add layer (polygon, etc.) with custom style
      layers[i].setStyle({ weight: 5, color: colorMap[color], opacity: 0.75 });
      layers[i].addTo(featuregroup);
    } else {
      // Add layer (marker, etc.) as-is
      layers[i].addTo(featuregroup);
    }*/
  }

  if (start !== null && end !== null) {
    if (!start.equals(end, 100)) {
      L.marker(end, {
        icon: iconsMap[color]
      }).addTo(featuregroup);
    }
  }

  if (featuregroup.getLayers().length > 0) {
    featuregroup.addTo(map);
    addBounds(featuregroup.getBounds());

    return featuregroup;
  }
  console.warn("Empty track");
  return null;
}

function addBounds(o) {
  bounds = (bounds === null) ? o.pad(0.5) : bounds.extend(o.pad(0.5));
}

function addMarker(latlng, idx) {
  // Create location marker for each image, and open the image
  // when marker is clicked
  var marker = L.marker(latlng, {
    draggable: false, opacity: 0.5, icon: iconDefault
  }).on('click', function () {
    $('.justified-gallery .split-grid img').eq(idx).trigger('click');
  }).addTo(map);

  addBounds(latlng.toBounds(50));

  // When image is hovered over, move the map view to the image's 
  // associated marker
  $('.split-grid a').eq(idx).hover(function () {
    map.flyTo(marker.getLatLng());
    marker.setOpacity(1).setIcon(iconSelected);
  }, function () {
    marker.setOpacity(0.5).setIcon(iconDefault);
    if (bounds) map.flyToBounds(bounds);
  });
  return marker;
}

// Called once per page within the section.
function add(tracks, markers, index) {
  var b = null;
  $.each(tracks, function (i, track) {
    var featuregroup = showTrack(track[0], colors[nextColor()]);
    if (featuregroup) {
      featuregroup.on('mouseover', function () {
        featuregroup.bringToFront();
      });
      var featuregroupbounds = featuregroup.getBounds().pad(0.5);
      featuregroup.bindPopup(track[1]);
      b = (b === null) ? featuregroupbounds : b.extend(featuregroupbounds);
    }
  });

  $.each(markers, function (i, marker) {
    var m = addMarker(marker[0], marker[1]);
    if (marker.length > 2) m.bindPopup(marker[2]);
  });

  // This meant for the parent page
  // If you hover over the track page link, the map view will move to the track
  // If there is no track (e.g. there's only pictures), move to the first marker
  if (index !== undefined) {
    $('.list-layout li a').eq(index).hover(function() {
      if (tracks.length > 0) {
        map.flyToBounds(b)
      } else if (markers.length > 0) {
        map.flyTo(markers[0][0], 10);
      }
    }, function () {
    });

  }
}

function finalizeMap() {
  if (bounds) map.fitBounds(bounds);
}
