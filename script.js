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