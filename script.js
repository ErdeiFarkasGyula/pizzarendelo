const pizzaData = {
  sizes: [
    { id: 1, nev: "Kicsi", meret: "S", ar: 0 },
    { id: 2, nev: "Közepes", meret: "M", ar: 800 },
    { id: 3, nev: "Nagy", meret: "L", ar: 1500 }
  ],

  basePrice: 2000,

  sauces: [
    { id: 1, nev: "Paradicsomos", ar: 300 },
    { id: 2, nev: "Tejfölös", ar: 400 }
  ],

  toppings: [
    { id: 1, nev: "Sajt", ar: 500 },
    { id: 2, nev: "Sonka", ar: 600 },
    { id: 3, nev: "Gomba", ar: 450 }
  ]
};

let cart = [];

document.addEventListener('DOMContentLoaded', () => {
    renderSauces();
    renderToppings();
    setupEventListeners();
});

function renderSauces() {
    const sauceContainer = document.getElementById('sauceOptions');
    sauceContainer.innerHTML = pizzaData.sauces
        .map(sauce => `
            <label class="radio-option">
                <input type="radio" name="sauce" value="${sauce.id}" ${sauce.id === 1 ? 'checked' : ''}>
                <span>${sauce.nev}</span>
            </label>
        `)
        .join('');
}

function renderToppings() {
    const toppingContainer = document.getElementById('toppingOptions');
    toppingContainer.innerHTML = pizzaData.toppings
        .map(topping => `
            <label class="checkbox-label">
                <input type="checkbox" name="topping" value="${topping.id}">
                <span>${topping.nev} <span class="price-small">(+${topping.ar} Ft)</span></span>
            </label>
        `)
        .join('');
}


function calculatePrice() {
    const size = document.querySelector('input[name="size"]:checked').value;
    const sauceId = parseInt(document.querySelector('input[name="sauce"]:checked').value);
    const quantity = parseInt(document.getElementById('quantity').value) || 1;

    const basePriceWithSize = pizzaData.basePrices[size] + pizzaData.sizePrices[size];
    
    const sauce = pizzaData.sauces.find(s => s.id === sauceId);
    const saucePrice = sauce ? sauce.price : 0;

    const selectedToppings = document.querySelectorAll('input[name="topping"]:checked');
    let toppingsPrice = 0;

    selectedToppings.forEach(checkbox => {
        const toppingId = parseInt(checkbox.value);
        const topping = pizzaData.toppings.find(t => t.id === toppingId);
        if (topping) {
            toppingsPrice += topping.price;
        }
    });

    const pizzaPrice = basePriceWithSize + saucePrice + toppingsPrice;
    const totalPrice = pizzaPrice * quantity;

    document.getElementById('pizzaPrice').textContent = pizzaPrice.toLocaleString('hu-HU') + ' Ft';
    document.getElementById('quantityDisplay').textContent = quantity + ' db';
    document.getElementById('totalPrice').textContent = totalPrice.toLocaleString('hu-HU') + ' Ft';

    return { pizzaPrice, totalPrice, quantity };
}

function setupEventListeners() {
    document.querySelectorAll('input[name="size"]').forEach(radio => {
        radio.addEventListener('change', calculatePrice);
    });

    document.querySelectorAll('input[name="sauce"]').forEach(radio => {
        radio.addEventListener('change', calculatePrice);
    });

    document.querySelectorAll('input[name="topping"]').forEach(checkbox => {
        checkbox.addEventListener('change', calculatePrice);
    });

    document.getElementById('quantity').addEventListener('change', calculatePrice);

    document.getElementById('addToCartButton').addEventListener('click', addToCart);

    document.getElementById('orderButton').addEventListener('click', showOrderSummary);

    document.getElementById('deleteAllButton').addEventListener('click', deleteAllCart);

    document.querySelector('.closeButton').addEventListener('click', closeModal);
    document.querySelector('.buttonCancel').addEventListener('click', closeModal);
    document.querySelector('.buttonConfirm').addEventListener('click', confirmOrder);

    document.getElementById('orderModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('orderModal')) {
            closeModal();
        }
    });
}

function addToCart() {
    const size = document.querySelector('input[name="size"]:checked').value;
    const sauceId = parseInt(document.querySelector('input[name="sauce"]:checked').value);
    const sauce = pizzaData.sauces.find(s => s.id === sauceId);

    const selectedToppings = Array.from(document.querySelectorAll('input[name="topping"]:checked')).map(cb => {
        const toppingId = parseInt(cb.value);
        return pizzaData.toppings.find(t => t.id === toppingId);
    });

    const { pizzaPrice, quantity } = calculatePrice();

    const cartItem = {
        id: Date.now(),
        size,
        sauce,
        toppings: selectedToppings,
        pizzaPrice,
        quantity,
        totalPrice: pizzaPrice * quantity
    };

    cart.push(cartItem);
    renderCart();
    showNotification('A Pizza a kosárba került!');
}

function renderCart() {
    const cartContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const orderBtn = document.getElementById('orderBtn');
    const deleteBtn = document.getElementById('deleteAllBtn');
    const finalTotal = document.getElementById('finalTotal');

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart">A kosár üres</p>';
        cartTotal.style.display = 'none';
        orderBtn.style.display = 'none';
        deleteBtn.style.display = 'none';
        return;
    }

    cartContainer.innerHTML = cart
        .map(item => `
            <div class="cart-item">
                <div class="item-details">
                    <div class="item-name">${item.size} méretű pizza</div>
                    <div class="item-specs">
                        <span><strong>Szósz:</strong> ${item.sauce.name}</span><br>
                        <span><strong>Feltét:</strong> ${item.toppings.length > 0 ? item.toppings.map(t => t.name).join(', ') : 'Csak sajt'}</span>
                    </div>
                    <div class="item-specs">
                        <span><strong>Darabszám:</strong> ${item.quantity} db</span>
                    </div>
                </div>
                <div class="item-price">
                    <strong>${item.totalPrice.toLocaleString('hu-HU')} Ft</strong>
                    <small>${item.pizzaPrice.toLocaleString('hu-HU')} Ft/db</small>
                </div>
                <button class="item-remove" onclick="removeFromCart(${item.id})">Eltávolítás</button>
            </div>
        `)
        .join('');

    const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    finalTotal.textContent = total.toLocaleString('hu-HU') + ' Ft';

    cartTotal.style.display = 'block';
    orderBtn.style.display = 'block';
    deleteBtn.style.display = 'block';
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    renderCart();
    showNotification('Pizza eltávolítva a kosárból');
}

function deleteAllCart() {
    if (confirm('Biztosan törölnéd az egész kosarat?')) {
        cart = [];
        renderCart();
        showNotification('Kosár kitisztítva');
    }
}

function showOrderSummary() {
    const modal = document.getElementById('orderModal');
    const summaryContainer = document.getElementById('orderSummary');

    const summaryHTML = cart
        .map((item, index) => `
            <div class="summary-item">
                <div class="summary-item-name">${index + 1}. Pizza - ${item.size} méret</div>
                <div class="summary-item-details">
                    <strong>Szósz:</strong> ${item.sauce.name}<br>
                    <strong>Feltét:</strong> ${item.toppings.length > 0 ? item.toppings.map(t => t.name).join(', ') : 'Csak sajt'}<br>
                    <strong>Darabszám:</strong> ${item.quantity} db
                </div>
                <div class="summary-item-price">${item.totalPrice.toLocaleString('hu-HU')} Ft</div>
            </div>
        `)
        .join('');

    const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalHTML = `<div class="summary-total">Végösszesen: ${total.toLocaleString('hu-HU')} Ft</div>`;

    summaryContainer.innerHTML = summaryHTML + totalHTML;
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('orderModal').style.display = 'none';
}

function confirmOrder() {
    const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    showNotification(`Rendelés megerősítve! Teljes ár: ${total.toLocaleString('hu-HU')} Ft`);
    closeModal();
    cart = [];
    renderCart();
}

function showNotification(message) {
    alert(message);
}