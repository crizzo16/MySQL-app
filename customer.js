let inquirer = require("inquirer");
let mysql = require("mysql");
const cTable = require('console.table');
require("dotenv").config();

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.MYSQL_WORKBENCH,
    database: "bamazon"
});

function hello() {
    console.log("\n\nHello and Welcome to Bamazon!\nYour destination for all things nerdy and lasercut!");
}

let displayProducts = new Promise(function (resolve, reject) {
    let query = connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        console.log("\n********************************************");
        console.table(res); // Maybe format data before displaying it
        console.log("********************************************\n");
        resolve(res);
        reject("There was a problem");
    });
});

function buy(res) {
    inquirer.prompt([
        {
            name: "id",
            message: "What is the ID of the product you would like to buy?"
        },
        {
            name: "quantity",
            message: "How many units would you like to buy?"
        }
    ]).then(function (answers) {
        // The user must order at least one item
        if (answers.quantity > 0) {
            // Find and store the item that the consumer wants to buy
            let choice;
            for (let i = 0; i < res.length; i++) {
                if (res[i].id === parseInt(answers.id)) {
                    choice = res[i];
                }
            }
            // If the product with that ID doesn't exist, end the connection and let the user know that and end this function
            if (choice === undefined) {
                console.log("\n404 NOT FOUND\nThe item you are looking for doesn not exist!");
                connection.end();
                return;
            }

            // If there isn't enough in stock
            if (parseInt(choice.stock_quantity) < parseInt(answers.quantity)) {
                console.log("\nInsufficient quantity in stock for purchase to go through.\nCheck back in later to see if we get more in stock!");
            }
            // Otherwise let the user buy their product 
            else {
                // TODO update database
                let newAmount = choice.stock_quantity - answers.quantity;
                let updateThis = [
                    {
                        stock_quantity: newAmount
                    },
                    {
                        id: answers.id
                    }
                ];
                connection.query("UPDATE products SET ? WHERE ?", updateThis, function (error) {
                    if (error) throw error;
                    console.log("Order placed successfully!");
                });

                // Calculate their cost & let them know
                let single_price = choice.price;
                let amount = parseFloat(answers.quantity);
                let total = single_price * amount;
                console.log("\nCongratulations on your order of " + choice.product_name + ".\nYour total cost is $" + total.toFixed(2));
            }
        } else {
            console.log("\nYou must purchase at least one item!");
        }

        // End the connection after the user is informed of their purchase
        connection.end();
    });
}

hello();
displayProducts.then(function (value) {
    buy(value);
});
