const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const ejs = require('ejs');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res){
    let errorMessage = "";
    const valid = req.query.valid;
    if(valid == 0) {
        errorMessage += "Error in delivering";
    }
    const URL = "http://localhost:3000/orders";
    axios.get(URL).then(function(resultOrderAPIData){
        const orderListEmpty = resultOrderAPIData.data.orderListEmpty;
        const orderList = resultOrderAPIData.data.orderList;
        console.log(orderListEmpty);
        if(orderListEmpty == 1){
            res.send("Order List Empty");
        } else {
            console.log(orderList);
            res.render("admin", {orderList: orderList, errorMessage: errorMessage});
        }
    });
});

app.post("/delivered", function(req, res){
    const customerID = req.body.customerID;
    const URL = "http://localhost:3000/delivered/?customerID="+customerID;
    axios.get(URL).then(function(resultDelieveredAPIData){
        const orderDelivered = resultDelieveredAPIData.data.orderDelivered;
        if(orderDelivered == 0) {
            res.redirect("/?valid=0");
        } else {
            res.redirect("/");
        }
    });
});

app.listen(3002, function(req, res){
    console.log("Admin server up at port 3002");
});