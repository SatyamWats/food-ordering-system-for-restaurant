let carts = document.querySelectorAll('.add-to-cart');
let attributesArray = document.getElementsByTagName('label');

function onLoadCartNumber() {
    if(localStorage.getItem("totalItems")) {
        document.querySelector("button span").textContent = localStorage.getItem("totalItems");
    }
}

for(let i=0;i<carts.length;i++){
    carts[i].addEventListener("click", function(){
        let numberOfItems = parseInt(localStorage.getItem("totalItems"));
        if(!numberOfItems) {
            localStorage.setItem("totalItems", 1);
            document.querySelector("button span").textContent = localStorage.getItem("totalItems");
        } else{
            localStorage.setItem("totalItems", numberOfItems + 1);
            document.querySelector("button span").textContent = localStorage.getItem("totalItems");
        }
        let pressedItemName = attributesArray[6*i + 1].textContent;
        let pressedItemPrice = attributesArray[6*i + 3].textContent;
        let currentItem = {
            name: pressedItemName,
            price: pressedItemPrice,
            inCart: 0
        }

        updateCart(currentItem);

    });
}

function updateCart(currentItem){

    let cartItems = localStorage.getItem("itemsInCart");
    cartItems = JSON.parse(cartItems);

    if(cartItems != null) {

        if(cartItems[currentItem.name] == undefined) {
            cartItems = {
                ...cartItems,
                [currentItem.name] : currentItem
            }
        }

        cartItems[currentItem.name].inCart += 1;
    } else {
        currentItem.inCart = 1;
        cartItems = {
            [currentItem.name]: currentItem
        }
    }

    console.log()

    localStorage.setItem("itemsInCart", JSON.stringify(cartItems));
    
}

onLoadCartNumber();