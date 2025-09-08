var API_BASE = "https://openapi.programming-hero.com/api";

// DOM Elements
var categoryList = document.getElementById("category-list");
var productList = document.getElementById("product-list");
var cartItemsContainer = document.getElementById("cart-items");
var cartTotal = document.getElementById("cart-total");
var modal = document.getElementById("tree-modal");
var closeModalBtn = document.getElementById("close-modal");
var bottomCloseBtn = document.getElementById("bottom-close");

// Modal fields
var modalImage = document.getElementById("modal-image");
var modalName = document.getElementById("modal-name");
var modalDescription = document.getElementById("modal-description");
var modalCategory = document.getElementById("modal-category");
var modalPrice = document.getElementById("modal-price");
var modalAddBtn = document.getElementById("modal-add-to-cart");

// Cart
var cart = [];
var total = 0;
var currentPlant = null;

/*  normalizers */
function getId(o) {
  return (o && (o.id || o.plant_id || o.plantId || o.plantID)) || null;
}
function getName(o) {
  return (o && (o.name || o.plant_name || o.plantName || o.title)) || "Unnamed";
}
function getCat(o) {
  return (o && (o.category || o.category_name)) || "Tree";
}
function getPrice(o) {
  return Number((o && o.price) || 0) || 0;
}
function getImg(o) {
  return (o && (o.image || o.img || o.thumbnail || o.photo)) || "";
}
function getDesc(o) {
  return (o && (o.description || o.desc || o.details)) || "";
}

function pickPlantPayload(data) {
  return (data && (data.plant || data.plants)) || {};
}

//Load Categories
 
function loadCategories() {
  fetch(API_BASE + "/categories")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      var categories = (data && data.categories) || [];
      showCategories(categories);
    })
    .catch(function () {
      showError("categories");
    });
}

function showCategories(categories) {
  categoryList.innerHTML =
    '<li><button id="all-trees" class="w-full text-left px-4 py-2 rounded-md bg-green-600 text-white">All Trees</button></li>';

  categories.forEach(function (cat) {
    var catId = cat.id || cat.category_id || cat.cat_id || "";
    categoryList.innerHTML +=
      '<li><button data-id="' +
      catId +
      '" class="w-full text-left px-4 py-2 rounded-md hover:bg-green-100">' +
      getCat(cat) +
      "</button></li>";
  });

  if (!categoryList._bound) {
    categoryList.addEventListener("click", function (e) {
      if (e.target.tagName !== "BUTTON") return;
      var id = e.target.getAttribute("data-id");
      if (id) loadPlantsByCategory(id);
      else loadAllPlants();
    });
    categoryList._bound = true;
  }
}


   //Load All Plants

function loadAllPlants() {
  showLoading();
  fetch(API_BASE + "/plants")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      showPlants((data && data.plants) || []);
    })
    .catch(function () {
      showError("plants");
    });
}


   //Load Plants by Category

function loadPlantsByCategory(id) {
  showLoading();
  fetch(API_BASE + "/category/" + id)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      var plants = (data && data.plants) || [];
      if (plants.length) showPlants(plants);
      else showEmptyMessage();
    })
    .catch(function () {
      showError("plants");
    });
}

   //Show Plants
function showPlants(plants) {
  productList.innerHTML = "";
  plants.forEach(function (tree) {
    var id = getId(tree);
    var name = getName(tree);
    var img = getImg(tree);
    var cat = getCat(tree);
    var price = getPrice(tree);
    var short = (getDesc(tree) || "").substring(0, 80);

    productList.innerHTML +=
      '<div class="bg-white p-4 rounded-xl shadow">' +
      '<img data-id="' +
      (id || "") +
      '" src="' +
      img +
      '" alt="' +
      name +
      '" class="open-detail w-full h-32 object-cover rounded mb-4">' +
      '<h3 data-id="' +
      (id || "") +
      '" class="open-detail font-semibold text-green-700 cursor-pointer hover:underline">' +
      name +
      "</h3>" +
      '<p class="text-sm text-gray-600">' +
      (short ? short + "..." : "") +
      "</p>" +
      '<span class="text-xs inline-block mt-2 px-2 py-1 bg-green-100 text-green-600 rounded">' +
      cat +
      "</span>" +
      '<div class="flex justify-between items-center mt-4">' +
      '<span class="font-semibold">৳' +
      price +
      "</span>" +
      '<button data-id="' +
      (id || "") +
      '" data-name="' +
      name +
      '" data-price="' +
      price +
      '" class="add-to-cart bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Add to Cart</button>' +
      "</div>" +
      "</div>";
  });

  if (!plants.length) showEmptyMessage();
}

  // Event Delegation
if (!productList._bound) {
  productList.addEventListener("click", function (e) {
    if (e.target.classList.contains("open-detail")) {
      var id = e.target.getAttribute("data-id");
      if (!id) {
        showToast("Missing plant id for details.");
        return;
      }
      handleViewDetails(id);
    }

    if (e.target.classList.contains("add-to-cart")) {
      var item = {
        id: e.target.getAttribute("data-id") || null,
        name: e.target.getAttribute("data-name") || "Unnamed",
        price: Number(e.target.getAttribute("data-price")) || 0,
      };
      addToCart(item);
    }
  });
  productList._bound = true;
}

/* =========================
   Load Plant Detail (Modal)
========================= */
function handleViewDetails(id) {
  modal.classList.remove("hidden");
  modalName.textContent = "";
  modalDescription.textContent =
    '<div class="flex justify-center items-center py-10">' +
    '<div class="animate-spin rounded-full h-10 w-10 border-t-4 border-green-600 border-solid"></div>' +
    "</div>";
  modalCategory.textContent = "";
  modalPrice.textContent = "";
  modalImage.src = "";

  fetch(API_BASE + "/plant/" + id)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      var plant = pickPlantPayload(data);
      var norm = {
        id: getId(plant),
        name: getName(plant),
        image: getImg(plant),
        category: getCat(plant),
        price: getPrice(plant),
        desc: getDesc(plant),
      };

      currentPlant = { id: norm.id, name: norm.name, price: norm.price };

      modalName.textContent = norm.name || "Unnamed";
      modalImage.src = norm.image || "https://via.placeholder.com/300x200?text=No+Image";
      modalCategory.textContent = norm.category || "Tree";
      modalPrice.textContent = "৳" + (norm.price || 0);
      modalDescription.textContent = norm.desc || "No description available.";
    })
    .catch(function () {
      modalName.textContent = "Error loading details";
    });
}

// Modal Add-to-Cart
if (modalAddBtn) {
  modalAddBtn.addEventListener("click", function () {
    if (currentPlant) {
      addToCart(currentPlant);
      closeModal();
    }
  });
}

/* =========================
   Modal Close
========================= */
function closeModal() {
  if (modal) modal.classList.add("hidden");
}
if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
if (bottomCloseBtn) bottomCloseBtn.addEventListener("click", closeModal);
if (modal) {
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });
}
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeModal();
});


   //Cart

function addToCart(item) {
  cart.push(item);
  total += item.price || 0;
  updateCart();
}

function updateCart() {
  cartItemsContainer.innerHTML = "";
  cart.forEach(function (item, index) {
    cartItemsContainer.innerHTML +=
      '<li class="flex justify-between items-center bg-white p-2 rounded shadow">' +
      "<span>" +
      item.name +
      " ৳" +
      (item.price || 0) +
      "</span>" +
      '<button data-index="' +
      index +
      '" class="remove-item text-red-500 font-bold">×</button>' +
      "</li>";
  });
  cartTotal.textContent = "৳" + total;
}

cartItemsContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("remove-item")) {
    var index = parseInt(e.target.getAttribute("data-index"), 10);
    total -= cart[index].price || 0;
    cart.splice(index, 1);
    updateCart();
  }
});


function showLoading() {
  productList.innerHTML =
    '<div class="flex justify-center items-center py-10">' +
    '<div class="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600 border-solid"></div>' +
    "</div>";
}
function showError(type) {
  productList.innerHTML =
    '<div class="bg-red-500 p-3 rounded">Error loading ' + type + "!</div>";
}
function showEmptyMessage() {
  productList.innerHTML =
    '<div class="bg-orange-500 p-3 rounded">No items found</div>';
}
function showToast(msg) {
  console.warn(msg);
}
// Initial Load
loadCategories();
loadAllPlants();


