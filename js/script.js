const cartButtons = document.querySelectorAll(".add-cart, #add-to-cart");
const cartPopup = document.getElementById("cart-popup");
const cartItems = document.getElementById("cart-items");
const cartEmpty = document.getElementById("cart-empty");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const cartTotalPrice = document.getElementById("cart-total-price");
const cartTitleCount = document.getElementById("cart-title-count");
const orderSummary = document.getElementById("order-summary");
const summarySubtotalLabel = document.getElementById("summary-subtotal-label");
const summarySubtotal = document.getElementById("summary-subtotal");
const summaryTotal = document.getElementById("summary-total");
const qtyMinus = document.getElementById("qty-minus");
const qtyPlus = document.getElementById("qty-plus");
const qtyValue = document.getElementById("qty-value");
const productSubtotal = document.getElementById("product-subtotal");
const buyNowButton = document.getElementById("buy-now");
const accountButtons = document.querySelectorAll("[data-open-auth]");
const checkoutButtons = document.querySelectorAll(".checkout-button");
const checkoutForm = document.getElementById("checkout-form");
const checkoutSteps = document.getElementById("checkout-steps");
const cartLayout = document.getElementById("cart-layout");
const cartHeading = document.getElementById("cart-heading");
const continueShopping = document.getElementById("continue-shopping");
const checkoutError = document.getElementById("checkout-error");
const paymentSection = document.getElementById("payment-section");
const paymentAmount = document.getElementById("payment-amount");
const copyAmountButton = document.getElementById("copy-amount");
const paymentBackButton = document.getElementById("payment-back");
const paymentMethodButton = document.getElementById("payment-method");
const orderNumber = document.getElementById("order-number");
const loadMoreButton = document.getElementById("load-more-products");
const extraProducts = document.querySelectorAll(".product-extra");
const productCount = document.getElementById("product-count");

let selectedQuantity = 1;
let currentOrderTotal = 0;

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function getAccount() {
  return JSON.parse(localStorage.getItem("lpAccount")) || null;
}

function saveAccount(account) {
  localStorage.setItem("lpAccount", JSON.stringify(account));
  updateAccountButtons();
}

function updateAccountButtons() {
  const account = getAccount();

  accountButtons.forEach(function (button) {
    button.textContent = account ? "Account" : "Login";
  });
}

function createAuthModal() {
  if (document.getElementById("auth-modal")) {
    return;
  }

  const modal = document.createElement("div");
  modal.id = "auth-modal";
  modal.className = "auth-modal";
  modal.innerHTML = `
    <div class="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button class="auth-close" type="button" data-auth-close aria-label="Close">x</button>
      <h2 id="auth-title">Login or Create Account</h2>
      <p class="auth-copy">Please login before checkout. New customers can create an account here.</p>
      <label for="auth-name">Full Name</label>
      <input id="auth-name" type="text" placeholder="Your full name">
      <label for="auth-phone">Phone Number</label>
      <input id="auth-phone" type="tel" placeholder="012 345 678">
      <label for="auth-password">Password</label>
      <input id="auth-password" type="password" placeholder="Password">
      <div class="auth-actions">
        <button class="auth-submit" type="button" data-auth-action="login">Login</button>
        <button class="auth-create" type="button" data-auth-action="create">Create Account</button>
      </div>
      <p id="auth-error" class="auth-error"></p>
    </div>
  `;

  document.body.appendChild(modal);

  modal.addEventListener("click", function (event) {
    if (event.target === modal || event.target.matches("[data-auth-close]")) {
      closeAuthModal();
    }
  });

  modal.querySelectorAll("[data-auth-action]").forEach(function (button) {
    button.addEventListener("click", function () {
      const name = document.getElementById("auth-name").value.trim();
      const phone = document.getElementById("auth-phone").value.trim();
      const password = document.getElementById("auth-password").value.trim();
      const error = document.getElementById("auth-error");

      if (!name || !phone || !password) {
        error.textContent = "Please fill in name, phone, and password.";
        return;
      }

      saveAccount({ name: name, phone: phone, type: button.dataset.authAction });
      closeAuthModal();
      fillCheckoutContact();
      showCheckoutForm();
    });
  });
}

function openAuthModal() {
  createAuthModal();
  const modal = document.getElementById("auth-modal");
  modal.classList.add("show");
}

function closeAuthModal() {
  const modal = document.getElementById("auth-modal");

  if (modal) {
    modal.classList.remove("show");
  }
}

function fillCheckoutContact() {
  const account = getAccount();

  if (!account) {
    return;
  }

  const nameInput = document.getElementById("checkout-name");
  const phoneInput = document.getElementById("checkout-phone");

  if (nameInput) {
    nameInput.value = account.name;
  }

  if (phoneInput) {
    phoneInput.value = account.phone;
  }
}

function setCheckoutStep(stepNumber) {
  if (!checkoutSteps) {
    return;
  }

  checkoutSteps.hidden = false;

  checkoutSteps.querySelectorAll(".checkout-step").forEach(function (step) {
    const stepValue = Number(step.dataset.step);
    step.classList.toggle("active", stepValue === stepNumber);
    step.classList.toggle("done", stepValue < stepNumber);
  });
}

function showCheckoutForm() {
  if (!checkoutForm) {
    return;
  }

  setCheckoutStep(2);
  checkoutForm.hidden = false;
  if (paymentSection) {
    paymentSection.hidden = true;
  }
  if (cartLayout) {
    cartLayout.hidden = false;
  }
  if (cartHeading) {
    cartHeading.hidden = false;
  }
  if (continueShopping) {
    continueShopping.hidden = false;
  }
  checkoutForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function validateDeliveryForm() {
  const requiredFields = [
    document.getElementById("checkout-name"),
    document.getElementById("checkout-phone"),
    document.getElementById("checkout-street"),
    document.getElementById("checkout-city"),
  ];

  const missingField = requiredFields.find(function (field) {
    return field && !field.value.trim();
  });

  if (missingField) {
    if (checkoutError) {
      checkoutError.textContent = "Please fill in your name, phone number, street address, and city/province.";
    }

    missingField.focus();
    return false;
  }

  if (checkoutError) {
    checkoutError.textContent = "";
  }

  return true;
}

function showPaymentStep() {
  if (!paymentSection) {
    return;
  }

  setCheckoutStep(3);

  if (checkoutForm) {
    checkoutForm.hidden = true;
  }

  if (cartLayout) {
    cartLayout.hidden = true;
  }

  if (cartHeading) {
    cartHeading.hidden = true;
  }

  if (continueShopping) {
    continueShopping.hidden = true;
  }

  if (paymentAmount) {
    paymentAmount.textContent = "$" + currentOrderTotal.toFixed(2);
  }

  if (orderNumber && !orderNumber.dataset.ready) {
    orderNumber.textContent = "Order #ORD-" + Date.now().toString().slice(-8);
    orderNumber.dataset.ready = "true";
  }

  paymentSection.hidden = false;
  paymentSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateCartCount() {
  if (!cartCount) {
    return;
  }

  const count = getCart().reduce(function (total, product) {
    return total + product.quantity;
  }, 0);

  cartCount.textContent = count;
}

function showAddedPopup() {
  if (!cartPopup) {
    return;
  }

  cartPopup.classList.add("show");

  setTimeout(function () {
    cartPopup.classList.remove("show");
  }, 1800);
}

function getSelectedQuantity() {
  if (!qtyValue) {
    return 1;
  }

  return selectedQuantity;
}

function updateQuantityDisplay() {
  const productButton = document.getElementById("add-to-cart");

  if (!qtyValue || !productButton) {
    return;
  }

  qtyValue.textContent = selectedQuantity;

  if (productSubtotal) {
    const price = Number(productButton.dataset.price || 0);
    productSubtotal.textContent = "$" + (price * selectedQuantity).toFixed(2);
  }
}

function addProductToCart(button) {
  const quantity = getSelectedQuantity();
  const product = {
    name: normalizeProductName(button.dataset.name || "LP Shop Product"),
    price: Number(button.dataset.price || 0),
    quantity: quantity,
    image: button.dataset.image || getProductImage(button.dataset.name || ""),
  };

  const cart = getCart();
  const existingProduct = cart.find(function (item) {
    return item.name === product.name;
  });

  if (existingProduct) {
    existingProduct.quantity += quantity;
    existingProduct.image = product.image || existingProduct.image;
  } else {
    cart.push(product);
  }

  saveCart(cart);
  showAddedPopup();
}

cartButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    addProductToCart(button);

    if (button.id === "add-to-cart") {
      button.classList.add("added");

      const buttonText = button.querySelector(".button-text");
      if (buttonText) {
        buttonText.textContent = "Added!";
      }
    }
  });
});

if (qtyMinus && qtyPlus && qtyValue) {
  qtyMinus.addEventListener("click", function () {
    selectedQuantity = Math.max(1, selectedQuantity - 1);
    updateQuantityDisplay();
  });

  qtyPlus.addEventListener("click", function () {
    selectedQuantity += 1;
    updateQuantityDisplay();
  });

  updateQuantityDisplay();
}

if (buyNowButton) {
  buyNowButton.addEventListener("click", function () {
    const productButton = document.getElementById("add-to-cart");

    if (productButton) {
      addProductToCart(productButton);
    }

    window.location.href = "cart-inventory.html";
  });
}

accountButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    openAuthModal();
  });
});

checkoutButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    if (!getAccount()) {
      openAuthModal();
      return;
    }

    if (checkoutForm && !checkoutForm.hidden) {
      if (validateDeliveryForm()) {
        showPaymentStep();
      }
      return;
    }

    fillCheckoutContact();
    showCheckoutForm();
  });
});

if (paymentBackButton) {
  paymentBackButton.addEventListener("click", function () {
    showCheckoutForm();
  });
}

if (copyAmountButton) {
  copyAmountButton.addEventListener("click", function () {
    const text = paymentAmount ? paymentAmount.textContent : "";

    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text);
    }

    copyAmountButton.textContent = "Copied";
    setTimeout(function () {
      copyAmountButton.textContent = "Copy";
    }, 1400);
  });
}

if (paymentMethodButton) {
  paymentMethodButton.addEventListener("click", function () {
    setCheckoutStep(4);
    paymentMethodButton.classList.add("selected");
    paymentMethodButton.querySelector(".payment-arrow").textContent = "Done";
  });
}

if (loadMoreButton) {
  loadMoreButton.addEventListener("click", function () {
    extraProducts.forEach(function (product) {
      product.hidden = false;
    });

    if (productCount) {
      productCount.textContent = "10";
    }

    loadMoreButton.hidden = true;
  });
}

function getCartCount(cart) {
  return cart.reduce(function (total, product) {
    return total + product.quantity;
  }, 0);
}

function getCartSubtotal(cart) {
  return cart.reduce(function (total, product) {
    return total + product.price * product.quantity;
  }, 0);
}

function getProductImage(name) {
  const imageMap = {
    "BR001 Matching Bracelet": "images/matching-bracelet.jpg",
    "BR001 Smart Bracelet": "images/matching-bracelet.jpg"
  };
  return imageMap[name] || "";
}

function normalizeProductName(name) {
  const nameMap = {
    "BR001 Smart Bracelet": "BR001 Matching Bracelet"
  };
  return nameMap[name] || name;
}

function setCartQuantity(index, quantity) {
  const cart = getCart();

  if (!cart[index]) {
    return;
  }

  cart[index].quantity = Math.max(1, quantity);
  saveCart(cart);
  renderCartPage();
}

function removeCartItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCartPage();
}

function renderCartPage() {
  if (!cartItems) {
    return;
  }

  const cart = getCart();
  const itemCount = getCartCount(cart);
  const subtotal = getCartSubtotal(cart);
  const shipping = cart.length > 0 ? 2 : 0;
  const total = subtotal + shipping;
  currentOrderTotal = total;

  cartItems.innerHTML = "";

  if (cartTitleCount) {
    cartTitleCount.textContent = "(" + itemCount + " " + (itemCount === 1 ? "item" : "items") + ")";
  }

  if (cart.length === 0 && cartEmpty) {
    cartEmpty.style.display = "block";
  }

  if (cart.length > 0 && cartEmpty) {
    cartEmpty.style.display = "none";
  }

  cart.forEach(function (product, index) {
    const itemTotal = product.price * product.quantity;
    const cartImage = product.image || getProductImage(product.name);

    const item = document.createElement("div");
    item.className = "cart-item";
    item.innerHTML = `
      <div class="cart-thumb">
        <span class="cart-thumb-logo">LP</span>
        ${cartImage ? `<img src="${cartImage}" alt="${product.name}" class="cart-thumb-img">` : `<span class="cart-thumb-item"></span>`}
      </div>
      <div class="cart-product-info">
        <p class="cart-name">${product.name}</p>
        <p class="cart-unit-price">$${product.price.toFixed(2)}</p>
        <div class="cart-quantity" aria-label="Change quantity">
          <button class="cart-quantity-button" type="button" data-action="decrease" data-index="${index}">-</button>
          <span>${product.quantity}</span>
          <button class="cart-quantity-button" type="button" data-action="increase" data-index="${index}">+</button>
        </div>
      </div>
      <p class="cart-price">$${itemTotal.toFixed(2)}</p>
      <button class="remove-cart-item" type="button" data-action="remove" data-index="${index}" aria-label="Remove item">x</button>
    `;

    cartItems.appendChild(item);
  });

  if (cart.length > 0 && cartTotal && cartTotalPrice) {
    cartTotal.hidden = false;
    cartTotalPrice.textContent = "$" + total.toFixed(2);
  }

  if (orderSummary) {
    orderSummary.hidden = cart.length === 0;
  }

  if (summarySubtotalLabel) {
    summarySubtotalLabel.textContent = "Subtotal (" + itemCount + " " + (itemCount === 1 ? "item" : "items") + ")";
  }

  if (summarySubtotal) {
    summarySubtotal.textContent = "$" + subtotal.toFixed(2);
  }

  if (summaryTotal) {
    summaryTotal.textContent = "$" + total.toFixed(2);
  }

  if (paymentAmount) {
    paymentAmount.textContent = "$" + total.toFixed(2);
  }
}

if (cartItems) {
  renderCartPage();

  cartItems.addEventListener("click", function (event) {
    const button = event.target.closest("[data-action]");

    if (!button) {
      return;
    }

    const index = Number(button.dataset.index);
    const cart = getCart();
    const product = cart[index];

    if (!product) {
      return;
    }

    if (button.dataset.action === "increase") {
      setCartQuantity(index, product.quantity + 1);
    }

    if (button.dataset.action === "decrease") {
      setCartQuantity(index, product.quantity - 1);
    }

    if (button.dataset.action === "remove") {
      removeCartItem(index);
    }
  });
}

updateCartCount();
updateAccountButtons();
