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

connection.connect(function (err) {
    if (err) throw errr;
    start();
});

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
            console.log("\nHave a nice day!");
            connection.end();
        }
    });
}

function viewAll() {
    let query = connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        console.log("\n********************************************");
        console.table(res); // Maybe format data before displaying it
        console.log("********************************************\n");

        start();
    });
}

function viewLow() {
    let query = connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
        if (err) throw err;

        console.log("\n********************************************");
        console.table(res); // Maybe format data before displaying it
        console.log("********************************************\n");

        start();
    });
}

function addInventory() {
    inquirer.prompt([
        {
            name: "id",
            type: "input",
            message: "What is the id of the product you would like to update?"
        },
        {
            name: "amount",
            type: "input",
            message: "How many would you like to add?"
        }
    ]).then(function (answers) {
        if (answers.amount > 0) {
            let choice = 1;
            // for (let i = 0; i < res.length; i++) {
            //     if (res[i].id === parseInt(answers.id)) {
            //         choice = res[i];
            //     }
            // }
            // If the product with that ID doesn't exist, end the connection and let the user know that and end this function
            if (choice === undefined) {
                console.log("\n404 NOT FOUND\nThe item you are looking for doesn not exist!");
                start();

            } else {
                connection.query('SELECT stock_quantity FROM products WHERE ?', { id: parseInt(answers.id) }, function (errr, res) {
                    if (errr) throw errr;

                    let updateAmount = [
                        {
                            stock_quantity: parseInt(answers.amount) + res[0].stock_quantity
                        },
                        {
                            id: parseInt(answers.id)
                        }
                    ];
                    connection.query("UPDATE products SET ? WHERE ?", updateAmount, function (error) {
                        if (error) throw error;
                        console.log("\nStock quantity updated successfully!\n");

                        start();
                    });
                });

            }
        }
    });
}

function addProduct() {
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
            name: "department",
            type: "input",
            message: "What department is the product in?"
        }
    ]).then(function (answers) {
        let values = {
            product_name: answers.product_name,
            price: parseFloat(answers.price),
            stock_quantity: parseInt(answers.quantity),
            department_name: answers.department
        }
        connection.query("INSERT INTO products SET ?", values, function (err, res) {
            console.log(+"\n" + answers.product_name + " has been added to the inventory list!\n");
            start();
        });
    });
}

function removeProduct() {
    connection.query("SELECT * from products", function (err, results) {
        if (err) throw err;

        inquirer.prompt({
            name: "product_id",
            type: "rawlist",
            choices: function() {
                var choiceArray = [];
                for (var i = 0; i < results.length; i++) {
                  choiceArray.push("\t" + results[i].id + "\t|\t" + results[i].product_name);
                }
                return choiceArray;
              }, 
            message: "What is the ID of the product you wish to remove?"
        }).then(function (answers) {
            connection.query("SELECT * FROM products WHERE id=" + parseInt(answers.product_id), function (err, res) {
                console.log("This is the product you have selected: \n");
                console.table(res);
                inquirer.prompt({
                    name: "response",
                    type: "rawlist",
                    message: "Are you sure you want to delete this product? You can't undo this.",
                    choices: ["YES", "NO"]
                }).then(function (answer) {
                    if (answer.response.toUpperCase() === "YES") {
                        connection.query("DELETE FROM products WHERE id=" + answers.product_id, function (err2, res2) {
                            console.log("\n" + res[0].product_name + " has been deleted.\n");
                            start();
                        });
                    } else {
                        console.log("\n" + res[0].product_name + " has NOT been deleted.\n");
                        start();
                    }
                });
            });
        });
    });
}