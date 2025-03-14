import { auth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from './firebase-config.js';
import { db, collection, addDoc, getDocs } from './firebase-config.js';

// console.log("INIT", app);
// console.log("Auth", auth);
// console.log("DB", db);

const dbCollection = collection(db, "products");

// login function
function login(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // console.log("Login Successful", user.email);
            if (user.email === 'admin@gmail.com') {
                window.location.href = 'add-product.html'
            }
            else {
                window.location.href = 'index.html'
            }
        })
        .catch((error) => {
            alert(error.message);
        });
}

const btnLogin = document.getElementById('btnlogin');
if (btnLogin) {
    btnLogin.addEventListener('click', login);
}
// end

// state 

// onAuthStateChanged(auth, (user) => {
//     const path = window.location.pathname;
//     if (!user && !path.includes('login.html')) {
//         window.location.href = 'login.html';
//     } else if (user && !path.includes('index.html') && !path.includes('add-product.html')) {
//         window.location.href = 'index.html';
//     }
// });
onAuthStateChanged(auth, (user) => {
    const hideBtn = document.getElementById('hide-btn');
    const hideLogin = document.getElementById('hide-login');
    const hideWishlist = document.querySelector('.nav-wishlist');
    const hideCart = document.querySelector('.nav-cart');
    // console.log(hideBtn);
    // console.log(hideLogin);


    const path = window.location.pathname;
    if (!user) {
        if (!path.includes('login.html') && !path.includes('index.html')) {
            window.location.href = 'login.html';
        }
    } else {
        if (user.email === 'user@gmail.com') {
            if (!path.includes('index.html') && !path.includes('wishlist.html') && !path.includes('cart.html')) {
                window.location.href = 'index.html';
            }
            hideBtn.style.display = "block";
            hideLogin.style.display = "none";
        } else if (user.email === 'admin@gmail.com') {
            if (!path.includes('add-product.html')) {
                window.location.href = 'add-product.html';
            }
            hideBtn.style.display = "block";
            hideLogin.style.display = "none";
            hideWishlist.style.display = "none";
            hideCart.style.display = "none";
        }
    }
});
// end

// Logout function
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', function () {
        signOut(auth).then(() => {
            window.location.href = 'login.html';
            localStorage.clear();
        }).catch((error) => {
            alert(error.message);
        });
    })
}
// end

// add product
async function addProduct(e) {
    try {
        e.preventDefault();
        const productName = document.getElementById('product-name').value;
        const productDesc = document.getElementById('product-desc').value;
        const productQuantity = document.getElementById('product-quantity').value;
        const productPrice = document.getElementById('product-price').value;
        const productUrl = document.getElementById('product-url').value;
        if (!productName || !productQuantity || !productPrice || !productUrl || !productDesc) {
            alert("Please Fill All Fields");
            return;
        }
        const docRef = await addDoc(dbCollection, {
            name: productName,
            quantity: productQuantity,
            price: productPrice,
            imageUrl: productUrl,
            desc: productDesc
        });
        console.log("Document written with ID: ", docRef.id);
        alert("Product added successfully!");
        formClear();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

const btnAddProduct = document.getElementById('btnAddProduct');
if (btnAddProduct) {
    btnAddProduct.addEventListener('click', addProduct);
}

// end

// reset fields
function formClear() {
    document.querySelector('form').reset();
}
// end

// product list
async function productList() {
    try {
        const querySnapshot = await getDocs(dbCollection);
        if (querySnapshot.empty) {
            const notFound = document.getElementById('not-found');
            notFound.innerHTML = "Product Not Found";
            notFound.style.color = "red";
        }
        querySnapshot.forEach((doc) => {
            const productContainer = document.getElementById('product-container');
            const productBox = document.createElement('div');
            productBox.classList.add('swiper-slide');
            const { name, desc, price, imageUrl } = doc.data();
            const id = doc.id;
            // console.log(doc.id);
            // console.log(name, desc, quantity, imageUrl);


            productBox.innerHTML = `
            <div class="card-product wow fadeInUp">
                <div class="card-product-wrapper aspect-ratio-0">
                    <a href="product-detail.html">
                        <img class="lazyload img-product"
                            data-src=${imageUrl}"
                            src="${imageUrl}" alt="${name}" title="${name}">
                    </a>
                    <div class="list-product-btn">
                        <a href="javascript:void(0);" class="box-icon wishlist btn-icon-action" data-product-id="${id}">
                            <span class="icon icon-heart"></span>
                            <span class="tooltip">Wishlist</span>
                        </a>
                    </div>
                    <div class="list-btn-main">
                        <a href="javascript:void(0);" class="btn-main-product" data-product-id="${id}" data-name="${name}" data-price="${price}">Add To
                            cart</a>
                    </div>
                </div>
                <div class="card-product-info">
                    <a href="product-detail.html" class="title link">${name}</a>
                    <p>${desc}</p>
                    <span class="price">$${price}</span>
                </div>
            </div>
        `;
            productContainer.appendChild(productBox);

            // Click Add To Cart
            const btnAddToCart = productBox.querySelector('.btn-main-product');
            btnAddToCart.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-product-id');
                const product = { name, desc, price, imageUrl }
                addToCart(productId, product);
            })
            // end

            // Click Wishlist
            const wishlistBtn = productBox.querySelector('.wishlist');
            wishlistBtn.addEventListener('click', (e) => {
                const productId = e.target.closest('a').getAttribute('data-product-id');
                const product = { name, desc, price, imageUrl }
                addToWishlist(productId, product)
                // console.log(productId);
            })


        })
    } catch (e) {
        // console.log("Error", e);
    }

}

productList();

// Add To Wishlist
function addToWishlist(productId, product) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const existingProduct = wishlist.find((item) => item.id === productId)
    if (existingProduct) {
        alert("Product is already in the Wishlist");
        return;
    }

    wishlist.push({ id: productId, ...product })
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
    updateWishlistCount();
}
// end

// Wishlist Count
function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistCount = wishlist.length;
    const countElement = document.getElementById('wishlist-count');
    if (countElement) {
        countElement.textContent = wishlistCount;
    }
}
updateWishlistCount();
// localStorage.clear()

// display wishlist
function displayWishlist() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistContainer = document.getElementById('wishlist-container');
    if (wishlistContainer) {
        wishlistContainer.innerHTML = '';
    }
    if (wishlist.length === 0) {
        const notFound = document.getElementById('empty');
        if (notFound) {
            notFound.innerHTML = "Wishlist Product Not Found";
            notFound.style.color = "red";
        }
    }
    wishlist.forEach(product => {
        const { id, name, desc, price, imageUrl } = product;
        const wishlistBox = document.createElement('div');
        wishlistBox.classList.add('swiper-slide');
        wishlistBox.innerHTML = `
        <div class="card-product wow fadeInUp">
            <div class="card-product-wrapper aspect-ratio-0">
                <a href="product-detail.html">
                    <img class="lazyload img-product"
                        data-src=${imageUrl}"
                        src="${imageUrl}" alt="${name}" title="${name}">
                </a>
                <div class="list-btn-main">
                    <a href="javascript:void(0);" class="btn-main-product" data-product-id="${id}" data-name="${name}" data-price="${price}">Add To
                        cart</a>
                    <a href="javascript:void(0);" class="remove-wishlist" data-product-id="${id}">Remove</a>
                </div>
            </div>
            <div class="card-product-info">
                <a href="product-detail.html" class="title link">${name}</a>
                <p>${desc}</p>
                <span class="price">$${price}</span>
            </div>
        </div>
    `;
        if (wishlistContainer) {
            wishlistContainer.appendChild(wishlistBox);
        }

        // Click Add To Cart
        const btnAddToCart = wishlistBox.querySelector('.btn-main-product');
        btnAddToCart.addEventListener('click', (e) => {
            const productId = e.target.getAttribute('data-product-id');
            const product = { name, desc, price, imageUrl }
            addToCart(productId, product);
        })
        // end

    })

}
displayWishlist();
// end

// addtocart 
function addToCart(productId, product) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find((item) => item.id === productId)
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ id: productId, ...product, quantity: 1 })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCartCount();
}
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const countDiv = document.getElementById('cart-count');
    if (countDiv) {
        countDiv.textContent = cartCount;
    }
}
updateCartCount();
// end

// Remove from wishlist functionality
const removeWishlistBtn = document.getElementById('wishlist-container')
if (removeWishlistBtn) {
    removeWishlistBtn.addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('remove-wishlist')) {
            const productId = e.target.getAttribute('data-product-id');
            removeWishlist(productId);
            updateWishlistCount();
            displayWishlist();
        }
    });
}

function removeWishlist(productId) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const filter = wishlist.filter(item => item.id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(filter));
    displayWishlist();
}
// end

// cart display
function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartTable = document.querySelector('.tf-table-page-cart');
    if (cartTable) {
        cartTable.innerHTML = '';
    }

    if (cart.length === 0) {
        const trElement = document.createElement('tr');
        trElement.innerHTML = '<td colspan="5" class="text-center">No Items In Cart</td>';
        if (cartTable) {
            cartTable.appendChild(trElement);
        }
        return;
    }

    const thead = document.createElement('thead');
    thead.innerHTML = `
    <tr>
        <th>Products</th>
        <th>Price</th>
        <th>Quantity</th>
        <th>Total Price</th>
        <th></th>
    </tr>
    `;
    if (cartTable) {
        cartTable.appendChild(thead);
    }

    let totalCartPrice = 0;

    cart.forEach(item => {
        const { id, name, price, imageUrl, quantity } = item;
        const totalPrice = price * quantity;
        totalCartPrice += totalPrice;

        const tbody = document.createElement('tbody');
        tbody.innerHTML = `
        <tr class="tf-cart-item">
        <td class="tf-cart-item_product">
            <a href="product-detail.html" class="img-box">
                <img src="${imageUrl}" alt="${name}">
            </a>
            <div class="cart-info">
                <a href="product-detail.html" class="cart-title link">${name}</a>
            </div>
        </td>
        <td data-cart-title="Price" class="tf-cart-item_price text-center">
            <div class="cart-price text-button price-on-sale">$${price}</div>
        </td>
        <td data-cart-title="Quantity" class="tf-cart-item_quantity">
            <div class="wg-quantity mx-md-auto">
                <span class="btn-quantity btn-decrease" data-id="${id}">-</span>
                <input type="text" class="quantity-product" name="number" value="${quantity}" data-id="${id}">
                <span class="btn-quantity btn-increase" data-id="${id}">+</span>
            </div>
        </td>
        <td data-cart-title="Total" class="tf-cart-item_total text-center">
            <div class="cart-total text-button total-price">$${totalPrice.toFixed(2)}</div>
        </td>
        <td data-cart-title="Remove" class="remove-cart" data-id="${id}"><span class="remove icon icon-close"></span></td>
        </tr>
        `;
        if (cartTable) {
            cartTable.appendChild(tbody);
        }

        const totalAmount = document.querySelectorAll('.total-amount');
        if (totalAmount) {
            totalAmount.forEach(total => {
                total.textContent = `$${totalCartPrice.toFixed(2)}`;
            })
        }
    })

}
displayCart();
// end

// quantity plus minus button
const parentDiv = document.querySelector('.tf-table-page-cart');
if (parentDiv) {
    parentDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-decrease') || e.target.classList.contains('btn-increase')) {
            const id = e.target.getAttribute('data-id');
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const product = cart.find(item => item.id === id);
            if (!product) return;
            if (e.target.classList.contains('btn-decrease') && product.quantity > 1) {
                product.quantity -= 1;
            } else if (e.target.classList.contains('btn-increase')) {
                product.quantity += 1;
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCart();
            updateCartCount();
        }

        if (e.target.closest('.remove-cart')) {
            const id = e.target.closest('.remove-cart').getAttribute('data-id');
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const updateCart = cart.filter(item => item.id !== id);
            localStorage.setItem('cart', JSON.stringify(updateCart));
            displayCart();
            updateCartCount();
        }
    })
}
// end




