// Require various node modules
let inquirer = require("inquirer");
let mysql = require("mysql");
const cTable = require('console.table');
require("dotenv").config();

// Create connection to database
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.MYSQL_WORKBENCH,
    database: "bamazon"
});

// Connect to the database
connection.connect(function (err) {
    if (err) throw errr;
    start();
});

// Handles which function the user would like to do
function start() {
    inquirer.prompt({
        name: "managerSelect",
        type: "rawlist",
        message: "What would you like to do?",
        choices: ["VIEW ALL", "VIEW LOW", "ADD INVENTORY", "ADD PRODUCT", "REMOVE PRODUCT", "EXIT"]
    }).then(function (answer) {
        if (answer.managerSelect.toUpperCase() === "VIEW ALL") {
            viewAll();
        } else if (answer.managerSelect.toUpperCase() === "VIEW LOW") {
            viewLow();
        } else if (answer.managerSelect.toUpperCase() === "ADD INVENTORY") {
            addInventory();
        } else if (answer.managerSelect.toUpperCase() === "ADD PRODUCT") {
            addProduct();
        } else if (answer.managerSelect.toUpperCase() === "REMOVE PRODUCT") {
            removeProduct();
        } else {
            // Selecting "EXIT" will take the user here
            console.log("\nHave a nice day!");
            connection.end();
        }
    });
}

// View all the products currently in store
function viewAll() {
    let query = connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        console.log("\n********************************************");
        console.table(formattedData(res)); //Data gets formatted before being displayed
        console.log("********************************************\n");

        // Prompt user again
        start();
    });
}

// View all products with less than 5 products in stock
function viewLow() {
    let query = connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
        if (err) throw err;

        console.log("\n********************************************");
        console.table(formattedData(res)); // Data is formatted before displaying
        console.log("********************************************\n");

        // Prompt user again
        start();
    });
}

function addInventory() {
    // Grab possible products to add to
    connection.query("SELECT * from products", function (err, results) {
        if (err) throw err;

        inquirer.prompt([
            {
                name: "choice",
                type: "rawlist",
                choices: function () {
                    let choiceArray = [];
                    for (let i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].product_name);
                    }
                    return choiceArray;
                },
                message: "What product would you like to update?"
            },
            {
                name: "amount",
                type: "input",
                message: "How many would you like to add?"
            }
        ]).then(function (answers) {
            // Only update if the manager want to add a real number of products
            if (answers.amount > 0) {
                // Select all data for the chosen product
                let chosenItem;
                for (let i = 0; i < results.length; i++) {
                    if (results[i].product_name === answers.choice) {
                        chosenItem = results[i];
                    }
                }

                // Update info for product
                let updateAmount = [
                    {
                        stock_quantity: parseInt(answers.amount) + chosenItem.stock_quantity
                    },
                    {
                        product_name: answers.choice
                    }
                ];
                connection.query("UPDATE products SET ? WHERE ?", updateAmount, function (error) {
                    if (error) throw error;
                    console.log("\nStock quantity updated successfully!\n");

                    // Prompt user again
                    start();
                });

            }
        });
    });
}

// Format the data (mostly adding dollar signs where needed)
function formattedData(res) {
    let formatted = [];
    for (let i = 0; i < res.length; i++) {
        let obj = {
            ID: res[i].id,
            Product: res[i].product_name,
            Price: parseFloat(res[i].price).toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            Quantity: res[i].stock_quantity,
            Department: res[i].department_name,
            "Total Sales": parseFloat(res[i].product_sales).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        };
        formatted.push(obj);
    }

    return formatted;
}

// Adds a new product
function addProduct() {
    // Query possible departments to add a new product into
    connection.query("SELECT name from departments", function (error, results) {
        if (error) throw error;
        inquirer.prompt([
            {
                name: "product_name",
                type: "input",
                message: "What is the name of the product?"
            }, {
                name: "price",
                type: "input",
                message: "What is the price of the product?"
            }, {
                name: "quantity",
                type: "input",
                message: "What is the initial quantity of the product?"
            }, { 
                // Can only choose a department from the department table
                name: "department", 
                type: "rawlist",
                choices: function () {
                    let choiceArray = [];
                    for (let i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].name);
                    }
                    return choiceArray;
                },
                message: "What department is the product in?"
            }
        ]).then(function (answers) {
            // Create new product
            let values = {
                product_name: answers.product_name,
                price: parseFloat(answers.price),
                stock_quantity: parseInt(answers.quantity),
                department_name: answers.department
            }
            // Ask the database very nicely to put the new product into the database
            connection.query("INSERT INTO products SET ?", values, function (err, res) {
                console.log(+"\n" + answers.product_name + " has been added to the inventory list!\n");

                // Prompt user again
                start();
            });
        });
    });
}

function removeProduct() {
    // Query to get all possible products to remove
    connection.query("SELECT * from products", function (err, results) {
        if (err) throw err;

        inquirer.prompt({
            name: "name",
            type: "rawlist",
            choices: function () {
                let choiceArray = [];
                for (let i = 0; i < results.length; i++) {
                    choiceArray.push(results[i].product_name);
                }
                return choiceArray;
            },
            message: "Which product do you want to remove?"
        }).then(function (answers) {
            // Make sure the user is SURE they want to delete this product, since it can't be undone
            inquirer.prompt({
                name: "response",
                type: "rawlist",
                message: "Are you sure you want to delete this product? You can't undo this.",
                choices: ["YES", "NO"]
            }).then(function (different) {
                // If they did want to delete it, delete it
                let changeThis = {product_name: answers.name};
                if (different.response.toUpperCase() === "YES") {
                    connection.query("DELETE FROM products WHERE ?", changeThis, function (err2, res2) {
                        console.log("\nThe product has been deleted.\n");

                        // Prompt user again
                        start();
                    });
                } else {
                    console.log("\n" + answers.name + " has NOT been deleted.\n");

                    // Prompt user again
                    start();
                }
            });
        });
    });
}