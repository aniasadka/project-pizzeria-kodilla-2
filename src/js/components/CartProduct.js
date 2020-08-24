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

    /*zapisz właściwość thisCartProduct.params nadając jej wartość JSON.parse
    (JSON.stringify(menuProduct.params)) (wyjaśnienie znajdziesz w poradniku JS), */

    thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

    /* wykonaj metodę getElements przekazując jej argument element, mentor: co oznacza wykonanie metody getElements????? */
    thisCartProduct.getElements(element);

    thisCartProduct.initActions();

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
  // Pozostaje nam jeszcze napisanie metody CartProduct.getData, która będzie zwracać wszystkie informacje o zamawianym produkcie – id, amount, price, priceSingle oraz params. Wszystkie te wartości są ustawiane w konstruktorze, więc nie powinno być problemu ze zwróceniem ich ("zapakowanych" w obiekt) z metody getData.
  getData() {
    const thisCartProduct = this;

    const orderedProductData = {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      params: thisCartProduct.params
    };

    return orderedProductData;

  }
}

export default CartProduct;
