/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      //console.log('new Product:', thisProduct);
    }


    renderInMenu() {
      const thisProduct = this;

      /*generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementsFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /*find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /*add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion() {
      const thisProduct = this;

      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        event.preventDefault();

        const activeProducts = document.querySelectorAll('.product.active');

        for (let activeProduct of activeProducts) {

          if (activeProduct != thisProduct.element) {
            activeProduct.classList.remove('active');
          }
        }

        thisProduct.element.classList.toggle('active');
      });
    }

    initOrderForm() {
      const thisProduct = this;
      //console.log('initOrderForm');

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });

        thisProduct.cartButton.addEventListener('click', function (event) {
          event.preventDefault();
          thisProduct.processOrder();
          thisProduct.addToCart();
        });
      }
    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }

    processOrder() {
      const thisProduct = this;
      //console.log('processOrder');

      const formData = utils.serializeFormToObject(thisProduct.form);

      thisProduct.params = {};

      /* set variable price to equal thisProduct.data.price */
      let price = thisProduct.data.price;

      // console.log(price);

      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        for (let optionId in param.options) {
          const option = param.options[optionId];

          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

          if (optionSelected && !option.default) {
            price += option.price;
          } else if (!optionSelected && option.default) {
            price -= option.price;
          }

          const imageClass = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);

          if (optionSelected) {
            if (!thisProduct.params[paramId]) {
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }
            thisProduct.params[paramId].options[optionId] = option.label;

            for (let singleClass of imageClass) {
              singleClass.classList.add(classNames.menuProduct.imageVisible);
            }
          } else {
            for (let singleClass of imageClass) {
              singleClass.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }


      /* multiply price by amount */
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = thisProduct.price;

      //console.log(thisProduct.params); czyy ja dobrze napisałam ten console.log?

    }

    addToCart() {
      const thisProduct = this;

      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;

      app.cart.add(thisProduct);
    }


  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.input.value = settings.amountWidget.defaultValue;
      // console.log(thisWidget.value);

      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

      // console.log('AmountWidget:', thisWidget);
      // console.log('constructor arguments:', element);
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) { // ustawianie nowej wartości widgetu
      const thisWidget = this;

      const newValue = parseInt(value);

      /* TODO: Add validation */


      if (newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        // console.log(newValue);
        // console.log(thisWidget.value);
        thisWidget.value = newValue;
        thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value;
    }

    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        const valueDecreased = thisWidget.value - 1;
        thisWidget.setValue(valueDecreased);
      });

      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        const valueIncreased = thisWidget.value + 1;
        thisWidget.setValue(valueIncreased);
      });
    }

    announce() {
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });

      thisWidget.element.dispatchEvent(event);
    }

  }

  /* pokazywanie i ukrywanie koszyka; dodawanie/usuwanie produktów; podliczanie ceny zamówienia */
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

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      /* zapisz właściwości thisCartProduct czerpiąc wartości z menuProduct 
      dla tych właściwości: id, name, price, priceSingle, amount, */

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.initActions();


      /*zapisz właściwość thisCartProduct.params nadając jej wartość JSON.parse
      (JSON.stringify(menuProduct.params)) (wyjaśnienie znajdziesz w poradniku JS), */

      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

      /* wykonaj metodę getElements przekazując jej argument element, mentor: co oznacza wykonanie metody getElements????? */
      thisCartProduct.getElements(element);
      // Nie zapomnij wykonać metody initAmountWidget w konstruktorze klasy CartProduct!
      thisCartProduct.initAmountWidget();

      //console.log('new CartProduct', thisCartProduct);
      //console.log('productData', menuProduct);
    }

    getElements(element) {
      // zdefiniuj stałą thisCartProduct i zapisz w niej obiekt this,
      const thisCartProduct = this;

      // stwórz pusty obiekt thisCartProduct.dom,
      thisCartProduct.dom = {};

      // stwórz właściwość thisCartProduct.dom.wrapper i przypisz jej wartość argumentu element,
      thisCartProduct.dom.wrapper = element;

      // stwórz kolejnych kilka właściwości obiektu thisCartProduct.dom 
      //i przypisz im elementy znalezione we wrapperze; te właściwości 
      // to: amountWidget, price, edit, remove (ich selektory znajdziesz w select.cartProduct)

      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
        // Wartością thisCartProduct.amount będzie właściwość value obiektu thisCartProduct.amountWidget,
        // ponieważ nasz AmountWidget sam aktualizuje tę właściwość
        thisCartProduct.amount = thisCartProduct.amountWidget.value;

        //Natomiast do właściwości thisCartProduct.price przypiszemy wartość mnożenia dwóch właściwości tej instancji 
        //(thisCartProduct) – priceSingle oraz amount (której przed chwilą nadaliśmy nową wartość).
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

        //thisCartProduct.processOrder();
      });
    }

    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions() {
      const thisCartProduct = this;

      // W tej metodzie stwórz dwa listenery eventów 'click': jeden dla guzika thisCartProduct.dom.edit, a drugi dla thisCartProduct.dom.remove. Oba mają blokować domyślną akcję dla tego eventu. Guzik edycji na razie nie będzie niczego robił, ale w handlerze guzika usuwania możemy dodać wywołanie metody remove.
      thisCartProduct.dom.edit.addEventListener('click', function (event) {
        event.preventDefault();
      });

      thisCartProduct.dom.remove.addEventListener('click', function (event) {
        event.preventDefault();
        thisCartProduct.remove();
      });
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;
      // console.log('thisApp.data:', thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },


    initCart: function () { // initCart będzie inicjować instancję koszyka
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },


    init: function () {
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);


      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },

  };

  app.init();
}
