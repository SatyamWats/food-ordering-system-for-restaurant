const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const axios = require('axios');
const http = require('http');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let customerID = "";

app.get("/", function(req, res){
    let errorMessage = "";
    const valid = req.query.valid;
    if(valid == 0)  errorMessage += "Table not present please try again";
    res.render("client",{errorMessage: errorMessage});
});

//-------------------------------AUTH TABLE------------------------------

app.post("/auth_table", function(req, res){
    const tableID = req.body.tableID;
    const URL = "http://localhost:3000/auth_table/"+tableID;

    axios.get(URL).then(function(resultAPIData){
        const gotTable = resultAPIData.data.gotTable;
        customerID = resultAPIData.data.customerID;
        console.log(customerID);
        if(gotTable == 0){
            res.redirect("/?valid=0");
        } else {
            res.redirect("/menu");
        }
    });

});

//------------------------------FETCH MENU-------------------------------

app.get("/menu", function(req, res){
    const URL = "http://localhost:3000/menu/?customerID="+customerID;
    axios.get(URL).then(function(resultFoodAPIData){
        const foodListEmpty = resultFoodAPIData.data.foodListEmpty;
        if(foodListEmpty == 1){
            console.log("Empty");
            res.redirect("/");
        } else {
            const foodList = resultFoodAPIData.data.foodList;
            const totalNumberOfFoods = resultFoodAPIData.data.totalNumberOfFoods;
            //console.log(totalNumberOfFoods);
            res.render("menu",{foodList: foodList, totalNumberOfFoods: totalNumberOfFoods});
        }
    });
});

app.post("/add-to-cart", function(req, res){
    const URL = "http://localhost:3000/add-to-cart/?customerID="+customerID+"&name="+req.body.name+"&quantity="+req.body.quantity
    res.redirect(URL);
});

app.get("/added-to-cart", function(req, res){
    res.render("add-to-cart");
});

app.post("/checkout", function(req, res){
    const URL = "http://localhost:3000/checkout/?customerID="+customerID;
    axios.get(URL).then(function(resultCheckoutAPIData){
        const checkoutDone = resultCheckoutAPIData.data.checkoutDone;
        if(checkoutDone == 1) {
            res.render("checkout");
        } else {
            res.redirect("/cart/?valid=0");
        }
    });
});

app.post("/cart", function(req, res){
    let errorMessage = "";
    if(req.query.valid == 0) {
        errorMessage += "Error in checking out, Try again";
    }
    const URL = "http://localhost:3000/get-cart-items/"+customerID;
    axios.get(URL).then(function(resultCartAPIData){
        const cartList = resultCartAPIData.data.cartList;
        res.render("cart", {cartList: cartList, errorMessage: errorMessage});
    });
});

app.get("*", function(req, res){
    res.send("PAGE NOT FOUND");
})

app.listen(3001, function(){
    console.log("Client server started at port 3001");
});