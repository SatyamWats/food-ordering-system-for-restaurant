const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', ejs);

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/outletDB");

const tableSchema = mongoose.Schema({
    ID: String
});

const foodSchema = mongoose.Schema({
    name: String,
    price: Number,
    type: Number
});

const cartSchema = mongoose.Schema({
    _id: String,
    foods: [{
        name: String,
        quantity: Number
    }]
});

const customerSchema = mongoose.Schema({
    _id: String,
    foods: [{
        name: String,
        quantity: Number
    }]
});

const Table = mongoose.model("Table", tableSchema);

const Food = mongoose.model("Food", foodSchema);

const Cart = mongoose.model("Cart", cartSchema);

const Customer = mongoose.model("Customer", customerSchema);

//------------------------AUTH TABLE-------------------------------

app.get("/auth_table/:tableID", function(req, res){
    const tableID = req.params.tableID;
    Table.findOne({ID: tableID}, async function(err, foundTable){
        if(err){
            console.log(err + "/n ERROR IN TABLE AUTH FIND");
            res.send(err);
        } else {
            if(foundTable){
                console.log("FOUND TABLE: " + foundTable.ID);
                let newCustomerID = await addNewCustomer();
                console.log( newCustomerID);
                res.send({gotTable: 1, customerID: newCustomerID});
            } else {
                console.log("TABLE NOT FOUND");
                res.send({gotTable: 0});
            }
        }
    });

});

async function addNewCustomer(){
    let idOfNewCart = generateID();
    const newCart = new Cart({
        _id: idOfNewCart,
        foods: []
    });
    newCart.save(function(err){
        if(err) {
            console.log("Error in saving new customer");
            console.log(err);
        } else {
            console.log("New Customer added");
        }
    });
    return idOfNewCart;
}

function generateID(){
    let ID = "";
    for(let i=0;i<8;i++){
        let charCode = 65 + Math.floor((Math.random()*26));
        let chance = Math.floor(Math.random()*2);
        if(chance == 1){
            charCode += 32;
        }
        let character = String.fromCharCode(charCode);
        ID+=character;
    }
    return ID;
}

app.get("/add-to-cart", function(req, res){
    const customerID = req.query.customerID;
    const nameOfFood = req.query.name;
    const quantityOfFood = req.query.quantity;
    const foodToBeAdded = {
        name: nameOfFood,
        quantity: quantityOfFood
    }
    Cart.updateOne({_id: customerID}, { $push: { foods: foodToBeAdded }}, function(err){
        if(err) {
            console.log("Error in food addition in cart");
        } else {
            console.log("Food inserted in cart");
        }
    });
    res.redirect("http://localhost:3001/added-to-cart")
});

app.get("/get-cart-items/:customerID", function(req, res){
    const customerID = req.params.customerID;
    console.log("REACHED");
    Cart.findOne({_id: customerID}, function(err, foundCartList){
        if(err) {
            console.log("API Error");
            res.send(err);
        } else {
            if(!foundCartList) {
                console.log("cart empty");
            } else {
                res.send({cartList: foundCartList.foods});
            }
        }
    })
});

//-------------------------------MENU---------------------------------

app.get("/menu", function(req, res){
    Food.find({}, async function(err,foodList){
        if(err){
            console.log(err);
        } else {
            if(!foodList){
                res.send({foodListEmpty: 1});
            } else {
                const customerID = req.query.customerID;
                //let totalNumberOfItemsInCart = await updateTotalItemsInCart(customerID);
                let totalNumberOfItemsInCart = 0;
                res.send({foodListEmpty: 0, foodList: foodList, totalNumberOfFoods: totalNumberOfItemsInCart});
            }
        }
    })
});

// async function updateTotalItemsInCart(customerID){
//     let totalNumberOfItemsInCart = 0;
//     Cart.findOne({_id: customerID}, function(err, resultCustomerCart){
//         const lengthOfCart = resultCustomerCart.foods.length;
//         return lengthOfCart;
//         //totalNumberOfItemsInCart += lengthOfCart;
//         //totalNumberOfItemsInCart = resultCustomerCart.foods.length;
//      });
//      console.log("length: "+totalNumberOfItemsInCart);
//      return totalNumberOfItemsInCart;
// }

app.get("/checkout", function(req, res){
    const customerID = req.query.customerID;
    
    Cart.findOne({_id: customerID}, function(err, resultCart){
        console.log(resultCart.foods);
        const newCustomer = new Customer({
            _id: customerID,
            foods: [...resultCart.foods]
        });
        newCustomer.save(function(err){
            if(err) {
                console.log("Error in saving new customer");
                console.log(err);
                res.send({checkoutDone: 0});
            } else {
                console.log("New Customer added");
                res.send({checkoutDone: 1});
            }
        });
    });

    Cart.findByIdAndDelete(customerID, function(err){
        if(err) {
            console.log("Error in deletion in cart");
            console.log(err);
        } else {
            console.log("Deletion Done");
        }
    })


});

app.get("/orders", function(req, res){
    Customer.find({}, function(err, orderList){
        if(err) {
            console.log("Error in order route");
            console.log(err);
        } else {
            let totalNumberOfOrders = 0;
            orderList.forEach(currentOrder => {
               totalNumberOfOrders += currentOrder.foods.length;
            });
            if(totalNumberOfOrders == 0) {
                console.log("Order List Empty");
                res.send({orderListEmpty: 1});
            } else {
                res.send({orderListEmpty: 0, orderList: orderList});
            }
        }
    })
});

app.get("/delivered", function(req, res){
    const customerID = req.query.customerID;
    Customer.findByIdAndDelete(customerID, function(err){
        if(err){
            console.log(err);
            res.send({orderDelivered: 0});
        } else {
            res.send({orderDelivered: 1});
        }
    });
});

app.listen(3000, function(){
    console.log("Server started at port 3000");
})