function fetchAllProducts() {
    fetch('https://fakestoreapi.com/products')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            appendPreviews(data);
        })
        .catch(function (err) {
            console.log('error: ' + err);
        });
}

function updateCartDisplay(cart, orderSum, emptyCartMsg) {
    const emptyCartBtn = document.getElementById('emptyCartBtn');
    if (cart.size === 0) {
        emptyCartBtn.classList.add('d-none');
        orderSum.classList.add('d-none')
        emptyCartMsg.classList.remove('d-none');
    } else {
        emptyCartBtn.classList.remove('d-none');
        orderSum.classList.remove('d-none');
        emptyCartMsg.classList.add('d-none');
    }
}

function createCartItem(data, quantity, productId) {
    const cartItem = document.createElement("div");
    cartItem.classList.add("col-12", "my-3", "border");
    cartItem.innerHTML = `
        <h3>${data.title}</h3>
        <p>Price: ${data.price} €</p>
        <p>Quantity: <span id="quantity-${productId}">${quantity}</span></p>
        <button id="increase-${productId}" class="btn btn-primary">+</button>
        <button id="decrease-${productId}" class="btn btn-primary">-</button>
    `;
    return cartItem;
}

function fetchProducts(productId) {
    return fetch('https://fakestoreapi.com/products/' + productId)
        .then(function (response) {
            return response.json();
        })
        .catch(function (err) {
            console.log('error: ' + err);
        });
}

async function increaseQuantity(productId) {
    let cart = new Map(JSON.parse(localStorage.getItem('cart')));
    let currentQuantity = cart.get(productId);
    currentQuantity++;
    cart.set(productId, currentQuantity);
    localStorage.setItem('cart', JSON.stringify(Array.from(cart.entries())));
    try {
        await getCartItems();
    } catch (error) {
        console.error('Error updating cart items after increasing quantity:', error);
    }
}

async function decreaseQuantity(productId) {
    let cart = new Map(JSON.parse(localStorage.getItem('cart')));
    let currentQuantity = cart.get(productId);
    currentQuantity--;

    if (currentQuantity <= 0) {
        cart.delete(productId);
    } else {
        cart.set(productId, currentQuantity);
    }

    localStorage.setItem('cart', JSON.stringify(Array.from(cart.entries())));
    try {
        await getCartItems();
    } catch (error) {
        console.error('Error updating cart items after decreasing quantity:', error);
    }
}


async function displayCartItems(cartItemsContainer, cart, orderSum) {
    orderSum.innerHTML = '';
    cartItemsContainer.innerHTML = '';
    let sumOfOrder = 0;
    const cartEntries = Array.from(cart.entries());

    cartEntries.sort((a, b) => a[0] - b[0]);

    // Fetch all products data and store them in an array
    const productsData = await Promise.all(
        cartEntries.map(([productId, _]) => fetchProducts(productId))
    );

    // Iterate through the cartEntries and productsData to display the cart items
    cartEntries.forEach(([productId, quantity], index) => {
        const data = productsData[index];
        sumOfOrder += (data.price * quantity);
        const cartItem = createCartItem(data, quantity, productId);
        cartItemsContainer.appendChild(cartItem);

        document.getElementById(`increase-${productId}`).addEventListener('click', () => {
            increaseQuantity(productId);
        });
        document.getElementById(`decrease-${productId}`).addEventListener('click', () => {
            decreaseQuantity(productId);
        });
        orderSum.innerHTML = `<strong>Total sum (including VAT):</strong> €${sumOfOrder.toFixed(2)}`;
    });
}

async function getCartItems() {
    let cart = new Map(JSON.parse(localStorage.getItem('cart')));
    const emptyCartMsg = document.getElementById('emptyCartMessage');
    const orderSum = document.getElementById('orderSum');
    const cartItemsContainer = document.getElementById("cartItems");

    updateCartDisplay(cart, orderSum, emptyCartMsg);

    try {
        await displayCartItems(cartItemsContainer, cart, orderSum);
    } catch (error) {
        console.error('Error displaying cart items:', error);
    }
}

async function emptyCart() {
    localStorage.removeItem('cart');
    try {
        await getCartItems();
    } catch (error) {
        console.error('Error updating cart items after emptying cart:', error);
    }
}

function appendPreviews(data) {
    const mainContainer = document.getElementById("getProductPreviews");
    for (let i = 0; i < data.length; i++) {
        const element = document.createElement("div");
        element.classList.add("col-xl-3", "col-lg-4", "col-md-6", "col-sm-12");
        element.innerHTML =
            '<div class="product-button" data-bs-toggle="modal"' +
            ' data-bs-target="#product-modal-' + i + '">' +
            '<p class="preview-price">' + data[i].price + " €" + '</p>' + '<br>' +
            '<p>' + data[i].title + '</p>' + '<br>' +
            '<img src=' + data[i].image + ' class="img-fluid" alt="product-picture">' +
            '</div>' +
            '<div class="modal fade modal-xl" id="product-modal-' + i + '">' +
            '<div class="modal-dialog modal-dialog-centered">' +
            '<div class="modal-content">' +
            '<div class="modal-body">' +
            '<div class="product-modal">' +
            '<h1 class="title">' + data[i].price + " €" + '</h1>' + '<br>' +
            //'<p class="category">' + data[i].category + '</p>' + '<br>' +
            '<h2 class="title">' + data[i].title + '</h2>' + '<br>' +
            '<img src=' + data[i].image + ' class="img-fluid" alt="product-picture">' + '<br>' +
            '<p class="description">' + data[i].description + '</p>' +
            '<div class="modal-footer justify-content-center"> ' +
            '<button class="btn btn-primary opacity-90 col-6 mx-3" onclick="addToCart(this.id, ' + (i + 1) + ')" id="' + (i + 1) + '">Order</button>' +
            '<button class="btn btn-danger opacity-90 col-6 mx-3" data-bs-dismiss="modal">Close</button></div> ' +
            '<div class="toast align-items-center text-white bg-success" data-toast-id="' + (i + 1) + '" role="alert" aria-live="assertive" aria-atomic="true">\n' +
            '    <div class="d-flex">\n' +
            '        <div class="toast-body">\n' +
            '            Product added to cart.\n' +
            '        </div>\n' +
            '        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>\n' +
            '    </div>\n' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        mainContainer.appendChild(element);
    }
}


let cart = new Map(JSON.parse(localStorage.getItem('cart')));

function addToCart(productId, toastId) {
    console.log(productId)
    if (cart.has(productId)) {
        cart.set(productId, cart.get(productId) + 1);
    } else {
        cart.set(productId, 1)
    }
    localStorage.setItem('cart', JSON.stringify(Array.from(cart)))
    console.log(cart)
    const toastEl = document.querySelector('.toast[data-toast-id="' + toastId + '"]');
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

function openOrderPage(id) {
    sessionStorage.setItem("idToOrder", id);
    window.open("order.html", '_self');
}

function fetchProduct() {
    fetch('https://fakestoreapi.com/products/' + sessionStorage.getItem("idToOrder"))
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            appendProduct(data);
        })
        .catch(function (err) {
            console.log('error: ' + err);
        });
}

function appendProduct(data) {
    const mainContainer = document.getElementById("getProduct");
    const element = document.createElement("div");
    element.classList.add("product");
    element.innerHTML =
        '<div class="product-box">' +
        '<h1>' + data.price + " €" + '</h1>' + '<br>' +
        // '<p class="category">' + data.category + '</p>' + '<br>' +
        '<p>' + data.title + '</p>' + '<br>' +
        '<img src=' + data.image + ' class="img-fluid" alt="product-picture">' + '<br>' +
        // '<p class="description">' + data.description + '</p>' +
        '</div>';
    mainContainer.appendChild(element);
}

let formName = document.getElementById("nameForm")
let formEmail = document.getElementById("emailForm")
let formPhone = document.getElementById("phoneForm")
let formAddress = document.getElementById("addressForm")
let formCity = document.getElementById("cityForm")
let formZip = document.getElementById("zipForm")
let buyButton = document.getElementById("buttonBuy")
let validationStatus = 0

buyButton.addEventListener("click", function (event) {
    event.preventDefault()
    validateName(formName.value)
    validateEmail(formEmail.value)
    validatePhone(formPhone.value)
    validateAddress(formAddress.value)
    validateCity(formCity.value)
    validateZip(formZip.value)
    console.log(validationStatus)
    console.log(formName.value)
    console.log(formEmail.value)
    console.log(formPhone.value)
    console.log(formAddress.value)
    console.log(formCity.value)
    console.log(formZip.value)

    if (validationStatus === 0) {
        console.log("Success")
        let obj = {
            customerName: formName.value,
            customerEmail: formEmail.value,
            customerPhone: formPhone.value,
            customerAddress: formAddress.value,
            customerCity: formCity.value,
            customerZip: formZip.value
        }
        let objJSON = JSON.stringify(obj)
        localStorage.setItem("localCustomerData", objJSON)
        window.open("confirmation.html", '_self');
    } else {
        console.error("Error")
    }
    validationStatus = 0
})

function loadAndClearInfo() {
    let customerDataJSON = localStorage.getItem("localCustomerData")
    let customerData = JSON.parse(customerDataJSON)
    let displayInfo = document.getElementById("orderconf")
    displayInfo.innerHTML =
        '<div class="order-confirm">' +
        '<h2 id="confhead">Order Confirmation</h2>' +
        '<br>' +
        '</div>' +
        '<div class="center">' +
        '<p>Name:</p>' +
        '<h4>' + customerData.customerName + '</h4>' +
        '<p>E-mail:</p>' +
        '<h4>' + customerData.customerEmail + '</h4>' +
        '<p>Phone:</p>' +
        '<h4>' + customerData.customerPhone + '</h4>' +
        '<p>Address:</p>' +
        '<h4>' + customerData.customerAddress + '</h4>' +
        '<p>Locality:</p>' +
        '<h4>' + customerData.customerCity + '</h4>' +
        '<p>Zip-code:</p>' +
        '<h4>' + customerData.customerZip + '</h4>' +
        '</div>'
    localStorage.removeItem("localCustomerData")
}

function validateName(name) {
    if (name.length < 2 || name.length > 50) {
        alert("Name must be between 2-50 characters.")
        validationStatus += 1
    }
}

function validateEmail(email) {
    if (!email.includes("@") && email.length > 50) {
        alert("E-mail must contain @, max 50 characters")
        validationStatus += 1
    }
}

function validatePhone(phone) {
    let regExp = /[a-öA-Ö]/i;

    if (regExp.test(phone) || phone.length > 50 || phone.length === 0) {
        alert("Phone number may only contain digits and max 50.")
        validationStatus += 1
    }
}

function validateAddress(address) {
    if (address.length < 4 || address.length > 50) {
        alert("Address must be between 4-50 characters.")
        validationStatus += 1
    }
}

function validateCity(city) {
    if (city.length < 2 || city.length > 50) {
        alert("Locality must be between 2-50 characters.")
        validationStatus += 1
    }
}

function validateZip(zip) {
    if (zip.length > 6 || zip[3] !== " ") {
        alert("Zip code must be in this format: xxx xx")
        validationStatus += 1
    }
}