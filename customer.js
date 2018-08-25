// Require various node modules
let inquirer = require("inquirer");
let mysql = require("mysql");
const cTable = require('console.table');
require("dotenv").config();

// Create database connection
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.MYSQL_WORKBENCH,
    database: "bamazon"
});

// Start connection
connection.connect(function (err) {
    if (err) throw errr;
    hello();
});

// Welcomes the user to the store
function hello() {
    console.log("\n\nHello and Welcome to Bamazon!\nYour destination for all things nerdy and lasercut!");
    
    // Display the current inventory
    displayProduts();
}

// Displays all products
function displayProduts() {
    let query = connection.query("SELECT id, product_name, price, stock_quantity, department_name FROM products", function (err, res) {
        if (err) throw err;

        // Format the data better (fixing column titles and formatting dollar amounts)
        let formatted = [];
        for (let i = 0; i < res.length; i++) {
            let obj = {
                ID: res[i].id,
                Product: res[i].product_name,
                Price: parseFloat(res[i].price).toLocaleString('en-US', {style: 'currency', currency: 'USD'}),
                Quantity: res[i].stock_quantity,
                Department: res[i].department_name
            };
            formatted.push(obj);
        }

        // Display the table
        console.log("\n********************************************");
        console.table(formatted); // data is formatted above
        console.log("********************************************\n");
        buy();
    });
};

// User can 'purchase' a quantity of a single product
function buy() {
    // Query to get all products user can buy
    connection.query("SELECT * FROM products", function (err, results) {
        inquirer.prompt([
            {
                name: "name",
                type: "rawlist",
                choices: function () {
                    var choiceArray = [];
                    for (var i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].product_name);
                    }
                    return choiceArray;
                },
                message: "Which product would you like to buy?"
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
                for (let i = 0; i < results.length; i++) {
                    if (results[i].product_name === answers.name) {
                        choice = results[i];
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
                    // Calculate the new quantity in stock
                    let newAmount = choice.stock_quantity - answers.quantity;
                    // Calculate the total sales for this product
                    let totalSales = (choice.price * answers.quantity) + choice.product_sales;
                    // Format data for query
                    let updateThis = [
                        {
                            stock_quantity: newAmount,
                            product_sales: totalSales
                        },
                        {
                            id: choice.id
                        }
                    ];
                    // Update the database
                    connection.query("UPDATE products SET ? WHERE ?", updateThis, function (error) {
                        if (error) throw error;
                        console.log("Order placed successfully!");
                    });

                    // Calculate their cost & let them know
                    let single_price = choice.price;
                    let amount = parseFloat(answers.quantity);
                    let total = single_price * amount;
                    console.log("\nCongratulations on your order of " + choice.product_name + ".\nYour total cost is " + total.toLocaleString('en-US', {style: "currency", currency: "USD"}) + ".");
                }
            } else {
                console.log("\nSorry you didn't find any products to your liking. Have a nice day and check back in for new products!");
            }

            // End the connection after the user is informed of their purchase
            connection.end();
        });
    });
}


