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
    setupEventListeners();
    calculatePrice();
});

function calculatePrice() {
    const sizeChecked = document.querySelector('input[name="size"]:checked');
    const sauceChecked = document.querySelector('input[name="sauce"]:checked');
    
    if (!sizeChecked || !sauceChecked) return;

    const sizeId = parseInt(sizeChecked.id === 'kicsi' ? '1' : sizeChecked.id === 'kozepes' ? '2' : '3');
    const sauceId = parseInt(sauceChecked.id === 'paradicsom' ? '1' : '2');

    const selectedSize = pizzaData.sizes.find(s => s.id === sizeId);
    const selectedSauce = pizzaData.sauces.find(s => s.id === sauceId);

    const selectedToppings = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => {
        const toppingId = checkbox.id === 'sonka' ? 2 : checkbox.id === 'gomba' ? 3 : 1;
        return pizzaData.toppings.find(t => t.id === toppingId);
    });

    let toppingsPrice = 0;
    selectedToppings.forEach(topping => {
        if (topping) toppingsPrice += topping.ar;
    });

    const pizzaPrice = pizzaData.basePrice + selectedSize.ar + selectedSauce.ar + toppingsPrice;

    document.getElementById('osszeg').textContent = 'Ár: ' + pizzaPrice.toLocaleString('hu-HU') + ' Ft';

    return { pizzaPrice, selectedSize, selectedSauce, selectedToppings };
}

function setupEventListeners() {
    document.getElementById('kicsi').addEventListener('change', calculatePrice);
    document.getElementById('kozepes').addEventListener('change', calculatePrice);
    document.getElementById('nagy').addEventListener('change', calculatePrice);

    document.getElementById('paradicsom').addEventListener('change', calculatePrice);
    document.getElementById('tejfol').addEventListener('change', calculatePrice);

    document.getElementById('sonka').addEventListener('change', calculatePrice);
    document.getElementById('gomba').addEventListener('change', calculatePrice);
    document.getElementById('sajt').addEventListener('change', calculatePrice);

    document.getElementById('rendelGomb').addEventListener('click', addToCart);
    document.getElementById('orderBtn').addEventListener('click', showOrderSummary);
    document.getElementById('deleteAllBtn').addEventListener('click', deleteAllCart);
}

function addToCart() {
    const sizeChecked = document.querySelector('input[name="size"]:checked');
    const sauceChecked = document.querySelector('input[name="sauce"]:checked');
    
    if (!sizeChecked || !sauceChecked) {
        showNotification('Kérlek válassz méretet és szószt!');
        return;
    }

    const sizeId = parseInt(sizeChecked.id === 'kicsi' ? '1' : sizeChecked.id === 'kozepes' ? '2' : '3');
    const sauceId = parseInt(sauceChecked.id === 'paradicsom' ? '1' : '2');

    const selectedSize = pizzaData.sizes.find(s => s.id === sizeId);
    const selectedSauce = pizzaData.sauces.find(s => s.id === sauceId);

    const selectedToppings = Array.from(document.querySelectorAll('input[name="topping"]:checked')).map(cb => {
        const toppingId = cb.id === 'sonka' ? 2 : cb.id === 'gomba' ? 3 : 1;
        return pizzaData.toppings.find(t => t.id === toppingId);
    });

    const priceData = calculatePrice();
    const quantity = 1;

    const cartItem = {
        id: Date.now(),
        size: selectedSize.nev,
        sauce: selectedSauce,
        toppings: selectedToppings,
        pizzaPrice: priceData.pizzaPrice,
        quantity,
        totalPrice: priceData.pizzaPrice * quantity
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
                        <span><strong>Szósz:</strong> ${item.sauce.nev}</span><br>
                        <span><strong>Feltét:</strong> ${item.toppings.length > 0 ? item.toppings.map(t => t.nev).join(', ') : 'Csak sajt'}</span>
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
                    <strong>Szósz:</strong> ${item.sauce.nev}<br>
                    <strong>Feltét:</strong> ${item.toppings.length > 0 ? item.toppings.map(t => t.nev).join(', ') : 'Csak sajt'}<br>
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