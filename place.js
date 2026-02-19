function Place(name, location, landmarks, timeOfYear, notes, imageUrl) {
  this.name = name;
  this.location = location;
  this.landmarks = landmarks;
  this.timeOfYear = timeOfYear;
  this.notes = notes;
  this.imageUrl = imageUrl;
  this.galleryImages = [];
}

Place.prototype.getSummary = function () {
  return this.name + " (" + this.location + ")";
};

Place.prototype.getDetails = function () {
  return {
    name: this.name,
    location: this.location,
    landmarks: this.landmarks,
    timeOfYear: this.timeOfYear,
    notes: this.notes,
    imageUrl: this.imageUrl,
    galleryImages: this.galleryImages
  };
};

function PlaceBook() {
  this.places = {};
  this.currentId = 0;
}

PlaceBook.prototype.assignId = function () {
  this.currentId += 1;
  return this.currentId;
};

PlaceBook.prototype.addPlace = function (place) {
  place.id = this.assignId();
  this.places[place.id] = place;
};

PlaceBook.prototype.findPlace = function (id) {
  if (this.places[id] !== undefined) {
    return this.places[id];
  }
  return false;
};

PlaceBook.prototype.deletePlace = function (id) {
  if (this.places[id] === undefined) {
    return false;
  }
  delete this.places[id];
  return true;
};
