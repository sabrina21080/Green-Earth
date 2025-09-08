const API_BASE = "https://openapi.programming-hero.com/api";

// DOM Elements
const categoryList = document.getElementById("category-list");
const productList = document.getElementById("product-list");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const modal = document.getElementById("tree-modal");
const closeModalBtn = document.getElementById("close-modal");
const bottomCloseBtn = document.getElementById("bottom-close");

// Modal fields
const modalImage = document.getElementById("modal-image");
const modalName = document.getElementById("modal-name");
const modalDescription = document.getElementById("modal-description");
const modalCategory = document.getElementById("modal-category");
const modalPrice = document.getElementById("modal-price");
const modalAddBtn = document.getElementById("modal-add-to-cart"); // optional in your HTML

// Cart
let cart = [];
let total = 0;
let currentPlant = null; // store current plant for modal add-to-cart

/* ========= robust normalizers (handle multiple API shapes) ========= */
const getId   = (o) => o?.id ?? o?.plant_id ?? o?.plantId ?? o?.plantID ?? null;
const getName = (o) => o?.name ?? o?.plant_name ?? o?.plantName ?? o?.title ?? "Unnamed";
const getCat  = (o) => o?.category ?? o?.category_name ?? "Tree";
const getPrice= (o) => Number(o?.price ?? 0) || 0;
const getImg  = (o) => o?.image ?? o?.img ?? o?.thumbnail ?? o?.photo ?? "";
const getDesc = (o) => o?.description ?? o?.desc ?? o?.details ?? "";

// unify detail payload: supports {plant:{...}} and {plants:{...}}
const pickPlantPayload = (data) => data?.plant ?? data?.plants ?? {};

/* =========================
   Load Categories
========================= */
const loadCategories = () => {
  fetch(`${API_BASE}/categories`)
    .then((res) => res.json())
    .then((data) => {
      const categories = data?.categories ?? [];
      showCategories(categories);
    })
    .catch(() => showError("categories"));
};

const showCategories = (categories) => {
  // "All Trees"
  categoryList.innerHTML = `
    <li>
      <button id="all-trees" class="w-full text-left px-4 py-2 rounded-md bg-green-600 text-white">
        All Trees
      </button>
    </li>
  `;

  categories.forEach((cat) => {
    const catId = cat?.id ?? cat?.category_id ?? cat?.cat_id;
    categoryList.innerHTML += `
      <li>
        <button data-id="${catId ?? ""}" class="w-full text-left px-4 py-2 rounded-md hover:bg-green-100">
          ${getCat(cat)}
        </button>
      </li>
    `;
  });

  // Event delegation (only attach once)
  if (!categoryList._bound) {
    categoryList.addEventListener("click", (e) => {
      if (e.target.tagName !== "BUTTON") return;
      const id = e.target.dataset.id;
      showLoading();
      if (id) loadPlantsByCategory(id);
      else loadAllPlants();
    });
    categoryList._bound = true;
  }
};

/* =========================
   Load All Plants
========================= */
const loadAllPlants = () => {
  fetch(`${API_BASE}/plants`)
    .then((res) => res.json())
    .then((data) => showPlants(data?.plants ?? []))
    .catch(() => showError("plants"));
};

/* =========================
   Load Plants by Category
========================= */
const loadPlantsByCategory = (id) => {
  fetch(`${API_BASE}/category/${id}`)
    .then((res) => res.json())
    .then((data) => {
      const plants = data?.plants ?? [];
      plants.length ? showPlants(plants) : showEmptyMessage();
    })
    .catch(() => showError("plants"));
};

/* =========================
   Show Plants
========================= */
const showPlants = (plants) => {
  productList.innerHTML = "";
  plants.forEach((tree) => {
    const id = getId(tree);
    const name = getName(tree);
    const img = getImg(tree);
    const cat = getCat(tree);
    const price = getPrice(tree);
    const short = (getDesc(tree) || "").substring(0, 80);

    productList.innerHTML += `
      <div class="bg-white p-4 rounded-xl shadow">
        <img data-id="${id ?? ""}" src="${img}" alt="${name}" class="open-detail w-full h-32 object-cover rounded mb-4">
        <h3 data-id="${id ?? ""}" class="open-detail font-semibold text-green-700 cursor-pointer hover:underline">${name}</h3>
        <p class="text-sm text-gray-600">${short ? short + "..." : ""}</p>
        <span class="text-xs inline-block mt-2 px-2 py-1 bg-green-100 text-green-600 rounded">${cat}</span>
        <div class="flex justify-between items-center mt-4">
          <span class="font-semibold">৳${price}</span>
          <button data-id="${id ?? ""}" data-name="${name}" data-price="${price}" class="add-to-cart bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Add to Cart</button>
        </div>
      </div>
    `;
  });

  // If list is empty (defensive)
  if (!plants.length) showEmptyMessage();
};

/* =========================
   Event Delegation (Modal + Cart)
========================= */
if (!productList._bound) {
  productList.addEventListener("click", (e) => {
    // open modal when clicking image or name
    if (e.target.classList.contains("open-detail")) {
      const id = e.target.dataset.id;
      if (!id) {
        showToast("Missing plant id for details.");
        return;
      }
      handleViewDetails(id);
    }

    // add to cart from card
    if (e.target.classList.contains("add-to-cart")) {
      const item = {
        id: e.target.dataset.id || null,
        name: e.target.dataset.name || "Unnamed",
        price: Number(e.target.dataset.price) || 0,
      };
      addToCart(item);
    }
  });
  productList._bound = true;
}

/* =========================
   Load Plant Detail (Modal)
========================= */
const handleViewDetails = (id) => {
  // Show a lightweight loading state in modal (optional)
  if (modal && modalName) {
    modalName.textContent = "Loading...";
    modalDescription.textContent = "";
    modalCategory.textContent = "";
    modalPrice.textContent = "";
    if (modalImage) modalImage.src = "";
    modal.classList.remove("hidden");
  }

  fetch(`${API_BASE}/plant/${id}`)
    .then((res) => res.json())
    .then((data) => {
      const plant = pickPlantPayload(data);

      const norm = {
        id: getId(plant),
        name: getName(plant),
        image: getImg(plant),
        category: getCat(plant),
        price: getPrice(plant),
        desc: getDesc(plant),
      };

      // Keep a copy for "Add to cart" from modal
      currentPlant = { id: norm.id, name: norm.name, price: norm.price };

      // Fill modal safely
      if (modalName) modalName.textContent = norm.name || "Unnamed";
      if (modalImage) modalImage.src = norm.image || "https://via.placeholder.com/300x200?text=No+Image";
      if (modalCategory) modalCategory.textContent = norm.category || "Tree";
      if (modalPrice) modalPrice.textContent = "৳" + (norm.price || 0);
      if (modalDescription) modalDescription.textContent = norm.desc || "No description available.";

      modal?.classList.remove("hidden");
    })
    .catch((err) => {
      console.error("Error loading plant detail:", err);
      if (modalName) modalName.textContent = "Error loading details";
    });
};

// Modal Add-to-Cart (only if the button exists in your HTML)
if (modalAddBtn) {
  modalAddBtn.addEventListener("click", () => {
    if (currentPlant) {
      addToCart(currentPlant);
      closeModal();
    }
  });
}

/* =========================
   Modal close behavior
========================= */
function closeModal() {
  modal?.classList.add("hidden");
}
closeModalBtn?.addEventListener("click", closeModal);
bottomCloseBtn?.addEventListener("click", closeModal);
modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* =========================
   Cart
========================= */
function addToCart(item) {
  cart.push(item);
  total += item.price || 0;
  updateCart();
}

function updateCart() {
  cartItemsContainer.innerHTML = "";
  cart.forEach((item, index) => {
    cartItemsContainer.innerHTML += `
      <li class="flex justify-between items-center bg-white p-2 rounded shadow">
        <span>${item.name} ৳${item.price || 0}</span>
        <button data-index="${index}" class="remove-item text-red-500 font-bold">×</button>
      </li>
    `;
  });
  cartTotal.textContent = "৳" + total;
}

cartItemsContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-item")) {
    const index = parseInt(e.target.dataset.index, 10);
    total -= cart[index].price || 0;
    cart.splice(index, 1);
    updateCart();
  }
});

/* =========================
   UI Helpers
========================= */
const showLoading = () => {
  productList.innerHTML = `<div class="bg-green-500 p-3 rounded">Loading...</div>`;
};
const showError = (type) => {
  productList.innerHTML = `<div class="bg-red-500 p-3 rounded">Error loading ${type}!</div>`;
};
const showEmptyMessage = () => {
  productList.innerHTML = `<div class="bg-orange-500 p-3 rounded">No items found</div>`;
};
const showToast = (msg) => {
  console.warn(msg);
};

/* =========================
   Init
========================= */
loadCategories();
loadAllPlants();


