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
            console.log("Login Successful", user.email);
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
    const path = window.location.pathname;
    if (!user) {
        if (!path.includes('login.html') && !path.includes('index.html')) {
            window.location.href = 'login.html';
        }
    } else {
        if (user.email === 'user@gmail.com') {
            if (!path.includes('index.html')) {
                window.location.href = 'index.html';
            }
        } else if (user.email === 'admin@gmail.com') {
            if (!path.includes('add-product.html') && !path.includes('index.html')) {
                window.location.href = 'add-product.html';
            }
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
        querySnapshot.forEach((doc) => {
            const productContainer = document.getElementById('product-container');
            if (!productContainer) {
                // console.error("Product container element not found.");
                return;
            }
            const productBox = document.createElement('div');
            productBox.classList.add('swiper-slide');
            const { name, desc, price, imageUrl } = doc.data();
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
                        <a href="javascript:void(0);" class="box-icon wishlist btn-icon-action">
                            <span class="icon icon-heart"></span>
                            <span class="tooltip">Wishlist</span>
                        </a>
                    </div>
                    <div class="list-btn-main">
                        <a href="#shoppingCart" data-bs-toggle="modal" class="btn-main-product">Add To
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
        })
    } catch (e) {
        console.log("Error", e);
    }

}

productList();