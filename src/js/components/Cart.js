class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = []; //  przechowuje produkty dodane do koszyka

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.getElements(element);
    thisCart.initActions(element);


    //console.log('new Cart', thisCart);
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {}; // przechowujemy tutaj wszystkie elementy DOM, wyszukane w komponencie koszyka. Ułatwi nam to ich nazewnictwo, ponieważ zamiast np. thisCart.amountElem będziemy mieli thisCart.dom.amount

    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);
    //thisCart.dom.toggleTrigger.classList.toggle(classNames.cart.wrapperActive);

    // 9.3 - 4.Pamiętamy o zdefiniowaniu thisCart.dom.productList w metodzie getElements.
    thisCart.dom.productList = element.querySelector(select.cart.productList);

    //W metodzie getElements dodaj ten kod:
    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

    for (let key of thisCart.renderTotalsKeys) {
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
    // W metodzie Cart.getElements dodaj właściwość thisCart.dom.form i przypisz jej element znaleziony we wrapperze koszyka za pomocą selektora zapisanego w select.cart.form
    thisCart.dom.form = element.querySelector(select.cart.form);
    console.log(thisCart.dom.form);
    // Zacznij od dodania do metody Cart.getElements właściwości dla inputów na numer telefonu i adres.
    thisCart.dom.phone = element.querySelector(select.cart.phone);
    console.log(thisCart.dom.phone);

    thisCart.dom.address = element.querySelector(select.cart.address);
    console.log(thisCart.dom.address);

  }

  initActions(element) {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      element.classList.toggle(classNames.cart.wrapperActive);
    });
    // Dzięki temu możemy teraz w metodzie Cart.initActions dodać taki kod:
    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function () {
      thisCart.remove(event.detail.cartProduct);
    });
    //Następnie w metodzie Cart.initActions dodaj event listener dla tego formularza. Nasłuchujemy eventu 'submit' i dodajemy event.preventDefault(), aby wysłanie formularza nie przeładowało strony.
    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;

    //Następnie w obiekcie payload zapisz ich wartości. Dodaj też wartości zliczane w update, czyli totalNumber, subtotalPrice i totalPrice. Aby dane były kompletne, dodaj też deliveryFee, mimo że jest niezmienne.
    // Obiekt payload musi też zawierać tablicę products, która na razie będzie pusta. 
    const payload = {
      phone: thisCart.dom.phone.value,
      address: thisCart.dom.address.value,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      totalPrice: thisCart.totalPrice,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    //Pod obiektem payload dodaj pętlę iterującą po wszystkich thisCart.products, i dla każdego produktu wywołaj jego metodę getData, którą za chwilę napiszesz. Wynik zwracany przez tą metodą dodaj do tablicy payload.products.
    for (let product of thisCart.products) {
      payload.products.push(product.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),

    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
  }

  add(menuProduct) {
    const thisCart = this;

    // Najpierw za pomocą odpowiedniego szablonu tworzymy kod HTML i zapisujemy go w stałej generatedHTML
    const generatedHTML = templates.cartProduct(menuProduct);

    //Następnie ten kod zamieniamy na elementy DOM i zapisujemy w następnej stałej – generatedDOM.
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    //Dodajemy te elementy DOM do thisCart.dom.productList.
    thisCart.dom.productList.appendChild(generatedDOM);

    //console.log('adding product', menuProduct);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    //console.log('thisCart.products', thisCart.products);

    //  dodaj jeszcze wywołanie metody update na końcu metody add
    thisCart.update();
  }

  update() {
    const thisCart = this;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    // Następnie użyj pętli for...of, iterującej po thisCart.products. Dla każdego z nich zwiększ thisCart.subtotalPrice o cenę (price) tego produktu, a thisCart.totalNumber – o jego liczbę (amount).
    for (let product of thisCart.products) {
      thisCart.subtotalPrice += product.price;
      thisCart.totalNumber += product.amount;
    }
    // Po zamknięciu pętli zapisz kolejną właściwość koszyka – thisCart.totalPrice – i przypisz jej wartość równą sumie właściwości subtotalPrice oraz deliveryFee.
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    //Teraz wróć do naszej metody update i na jej końcu dodaj:
    for (let key of thisCart.renderTotalsKeys) {
      for (let elem of thisCart.dom[key]) {
        elem.innerHTML = thisCart[key];
      }
    }

  }

  remove(cartProduct) {
    const thisCart = this;

    //zadeklarować stałą index, której wartością będzie indeks cartProduct w tablicy thisCart.products,
    const index = thisCart.products.indexOf(cartProduct);

    // użyć metody splice do usunięcia elementu o tym indeksie z tablicy thisCart.products,
    thisCart.products.splice(index);

    // usunąć z DOM element cartProduct.dom.wrapper,
    cartProduct.dom.wrapper.remove();

    //wywołać metodę update w celu przeliczenia sum po usunięciu produktu.
    thisCart.update();

  }


}

export default Cart;
