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

function getPlaceIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));
  return Number.isNaN(id) ? null : id;
}

function renderPlaceDetails(placeBook) {
  const detailsContent = document.getElementById("detailsContent");
  const editForm = document.getElementById("editForm");
  const editBtn = document.getElementById("editBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const placeId = getPlaceIdFromQuery();

  if (!placeId) {
    detailsContent.innerHTML = "<p>No place selected.</p>";
    editForm.classList.add("hidden");
    editBtn.classList.add("hidden");
    cancelEditBtn.classList.add("hidden");
    return;
  }

  const place = placeBook.findPlace(placeId);
  if (!place) {
    detailsContent.innerHTML = "<p>Place not found. Please go back and select a place.</p>";
    editForm.classList.add("hidden");
    editBtn.classList.add("hidden");
    cancelEditBtn.classList.add("hidden");
    return;
  }

  const info = place.getDetails();
  const notesText = info.notes && info.notes.trim() ? info.notes : "No notes provided.";
  const landmarksText = info.landmarks && info.landmarks.trim() ? info.landmarks : "N/A";
  const timeText = info.timeOfYear && info.timeOfYear.trim() ? info.timeOfYear : "N/A";
  const imageUrlText = info.imageUrl && info.imageUrl.trim() ? info.imageUrl : "";
  const imageHtml = imageUrlText
    ? `<img src="${imageUrlText}" alt="${info.name}" style="max-width:100%; border-radius:8px; margin:10px 0;" />`
    : "";

  if (imageUrlText) {
    document.body.style.backgroundImage = `url('${imageUrlText}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundAttachment = "fixed";
    setBackgroundColorFromImage(imageUrlText);
  } else {
    document.body.style.backgroundImage = "";
    document.body.style.backgroundSize = "";
    document.body.style.backgroundPosition = "";
    document.body.style.backgroundRepeat = "";
    document.body.style.backgroundAttachment = "";
    document.body.style.backgroundColor = info.backgroundColor || "#f4f4f4";
  }
  detailsContent.innerHTML = `
    <p><strong>Name:</strong> ${info.name}</p>
    <p><strong>Location:</strong> ${info.location}</p>
    <p><strong>Landmarks:</strong> ${landmarksText}</p>
    <p><strong>Time of Year:</strong> ${timeText}</p>
    ${imageHtml}
    <div class="journal-notes-lined">
      <p><strong>Journal:</strong></p>
      <p>${notesText}</p>
    </div>
  `;

  renderGallery(place, placeId);

  document.getElementById("editName").value = info.name || "";
  document.getElementById("editLocation").value = info.location || "";
  document.getElementById("editLandmarks").value = info.landmarks || "";
  document.getElementById("editTime").value = info.timeOfYear || "";
  document.getElementById("editImageUrl").value = info.imageUrl || "";
  document.getElementById("editNotes").value = info.notes || "";
  editForm.classList.add("hidden");
  editBtn.classList.remove("hidden");
  cancelEditBtn.classList.add("hidden");
}

function setBackgroundColorFromImage(imageUrl) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = function () {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const size = 50;
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(img, 0, 0, size, size);

    const data = ctx.getImageData(0, 0, size, size).data;
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count += 1;
    }

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);
    document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  };

  img.onerror = function () {
    document.body.style.backgroundColor = "#f4f4f4";
  };

  img.src = imageUrl;
}

function setEditMode(isEditing) {
  const detailsContent = document.getElementById("detailsContent");
  const editForm = document.getElementById("editForm");
  const editBtn = document.getElementById("editBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");

  if (isEditing) {
    detailsContent.classList.add("hidden");
    editForm.classList.remove("hidden");
    editBtn.classList.add("hidden");
    cancelEditBtn.classList.remove("hidden");
  } else {
    detailsContent.classList.remove("hidden");
    editForm.classList.add("hidden");
    editBtn.classList.remove("hidden");
    cancelEditBtn.classList.add("hidden");
  }
}

function savePlaceBook(placeBook) {
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

function handleEditSubmit(e, placeBook) {
  e.preventDefault();

  const placeId = getPlaceIdFromQuery();
  if (!placeId) return;

  const place = placeBook.findPlace(placeId);
  if (!place) return;

  place.name = document.getElementById("editName").value.trim();
  place.location = document.getElementById("editLocation").value.trim();
  place.landmarks = document.getElementById("editLandmarks").value.trim();
  place.timeOfYear = document.getElementById("editTime").value.trim();
  place.imageUrl = document.getElementById("editImageUrl").value.trim();
  place.notes = document.getElementById("editNotes").value.trim();

  savePlaceBook(placeBook);
  renderPlaceDetails(placeBook);
  setEditMode(false);
}

function renderGallery(place, placeId) {
  const gallerySection = document.getElementById("gallerySection");
  const galleryImages = document.getElementById("galleryImages");
  
  if (!place.galleryImages || place.galleryImages.length === 0) {
    gallerySection.classList.add("hidden");
    return;
  }

  gallerySection.classList.remove("hidden");
  galleryImages.innerHTML = "";

  place.galleryImages.forEach(function (imgUrl, index) {
    const item = document.createElement("div");
    item.className = "gallery-item";
    
    const img = document.createElement("img");
    img.src = imgUrl;
    img.alt = `Gallery image ${index + 1}`;
    
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-image-btn";
    removeBtn.type = "button";
    removeBtn.innerText = "×";
    removeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      removeGalleryImage(place, index);
    });
    
    item.appendChild(img);
    item.appendChild(removeBtn);
    galleryImages.appendChild(item);
  });
}

function removeGalleryImage(place, index) {
  place.galleryImages.splice(index, 1);
  const book = loadPlaceBook();
  const placeId = getPlaceIdFromQuery();
  const currentPlace = book.findPlace(placeId);
  if (currentPlace) {
    currentPlace.galleryImages = place.galleryImages;
    savePlaceBook(book);
  }
  renderGallery(place, placeId);
}

function handleAddImage(e, placeBook) {
  const placeId = getPlaceIdFromQuery();
  if (!placeId) return;

  const place = placeBook.findPlace(placeId);
  if (!place) return;

  const imageUrl = document.getElementById("newImageUrl").value.trim();
  if (!imageUrl) return;

  if (!place.galleryImages) {
    place.galleryImages = [];
  }

  place.galleryImages.push(imageUrl);
  savePlaceBook(placeBook);
  
  document.getElementById("newImageUrl").value = "";
  document.getElementById("addImageForm").classList.add("hidden");
  renderGallery(place, placeId);
}

window.addEventListener("load", function () {
  const book = loadPlaceBook();
  renderPlaceDetails(book);
  const editForm = document.getElementById("editForm");
  const editBtn = document.getElementById("editBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const toggleAddImageBtn = document.getElementById("toggleAddImageBtn");
  const addImageForm = document.getElementById("addImageForm");
  const cancelAddImageBtn = document.getElementById("cancelAddImageBtn");

  editBtn.addEventListener("click", function () {
    setEditMode(true);
  });

  cancelEditBtn.addEventListener("click", function () {
    setEditMode(false);
  });

  editForm.addEventListener("submit", function (e) {
    handleEditSubmit(e, book);
  });

  toggleAddImageBtn.addEventListener("click", function () {
    addImageForm.classList.toggle("hidden");
  });

  cancelAddImageBtn.addEventListener("click", function () {
    addImageForm.classList.add("hidden");
    document.getElementById("newImageUrl").value = "";
  });

  addImageForm.addEventListener("submit", function (e) {
    e.preventDefault();
    handleAddImage(e, book);
  });
});
