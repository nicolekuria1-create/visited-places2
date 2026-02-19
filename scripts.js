let placeBook = new PlaceBook();

function savePlaceBook() {
  const data = {
    currentId: placeBook.currentId,
    places: {}
  };

  Object.keys(placeBook.places).forEach(function (id) {
    const place = placeBook.places[id];
    data.places[id] = {
      id: place.id,
      name: place.name,
      location: place.location,
      landmarks: place.landmarks,
      timeOfYear: place.timeOfYear,
      notes: place.notes,
      imageUrl: place.imageUrl,
      galleryImages: place.galleryImages || []
    };
  });

  localStorage.setItem("placeBook", JSON.stringify(data));
}

function loadPlaceBook() {
  const stored = localStorage.getItem("placeBook");
  if (!stored) {
    return new PlaceBook();
  }

  let data;
  try {
    data = JSON.parse(stored);
  } catch (error) {
    localStorage.removeItem("placeBook");
    return new PlaceBook();
  }

  if (!data || typeof data !== "object") {
    localStorage.removeItem("placeBook");
    return new PlaceBook();
  }

  const book = new PlaceBook();
  book.currentId = data.currentId || 0;

  Object.keys(data.places || {}).forEach(function (id) {
    const item = data.places[id];
    const place = new Place(item.name, item.location, item.landmarks, item.timeOfYear, item.notes, item.imageUrl);
    place.id = item.id;
    place.galleryImages = item.galleryImages || [];
    book.places[place.id] = place;
  });

  return book;
}

function displayPlaces(placeBookToDisplay) {
  const placesList = document.getElementById("placesList");
  placesList.innerHTML = "";

  Object.keys(placeBookToDisplay.places).forEach(function (key) {
    const place = placeBookToDisplay.places[key];

    const li = document.createElement("li");
    li.className = "place-item";

    const nameLink = document.createElement("a");
    nameLink.innerText = place.getSummary();
    nameLink.href = `details.html?id=${place.id}`;
    nameLink.addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href = `details.html?id=${place.id}`;
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.setAttribute("data-id", place.id);

    li.appendChild(nameLink);
    li.appendChild(deleteBtn);
    placesList.appendChild(li);
  });
}

function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.innerText = message;
  notification.classList.remove("hidden");
  
  setTimeout(function () {
    notification.classList.add("hidden");
  }, 3000);
}

function handlePlaceClick(e) {
  if (e.target.tagName === "BUTTON" && e.target.dataset.id) {
    const id = parseInt(e.target.dataset.id);
    placeBook.deletePlace(id);
    savePlaceBook();
    displayPlaces(placeBook);
  }
}

function handleFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("placeName").value.trim();
  const location = document.getElementById("placeLocation").value.trim();
  const landmarks = document.getElementById("placeLandmarks").value.trim();
  const time = document.getElementById("placeTime").value.trim();
  const imageUrl = document.getElementById("placeImageUrl").value.trim();
  const notes = document.getElementById("placeNotes").value.trim();

  const newPlace = new Place(name, location, landmarks, time, notes, imageUrl);
  placeBook.addPlace(newPlace);
  savePlaceBook();

  displayPlaces(placeBook);
  e.target.reset();
  showNotification(`✓ "${name}" added to your travel journal!`);
}

window.addEventListener("load", function () {
  placeBook = loadPlaceBook();
  displayPlaces(placeBook);
  document.getElementById("placeForm").addEventListener("submit", handleFormSubmit);
  document.getElementById("placesList").addEventListener("click", handlePlaceClick);
});
