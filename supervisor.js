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
    if (err) throw err;
    start();
});

// Prompts the user on what action they would like to take
function start() {
    inquirer.prompt({
        name: "select",
        type: "rawlist",
        message: "What would you like to do?",
        choices: ["VIEW SALES", "CREATE NEW DEPARTMENT", "DELETE DEPARTMENT", "EXIT"]
    }).then(function (answers) {
        if (answers.select.toUpperCase() === "VIEW SALES") {
            viewSales();
        } else if (answers.select.toUpperCase() === "CREATE NEW DEPARTMENT") {
            newDepartment();
        } else if (answers.select.toUpperCase() === "DELETE DEPARTMENT") {
            deleteDepartment();
        } else {
            // Selecting "EXIT" just takes the user here
            connection.end();
        }
    });
}

// If the user would like to view the different departments
function viewSales() {
    // This was the hardest part of the whole assignment (I know if I say that this query slightly intimidates me with its complexity that whoever is grading this will just laugh to themselves)
    connection.query("SELECT id AS ID, name AS Department_Name, over_head_costs AS Overhead_Costs, Product_Sales, (newTable.Product_Sales - departments.over_head_costs) AS Total_Sales FROM departments LEFT JOIN (SELECT sum(product_sales) AS Product_Sales, department_name FROM products GROUP BY department_name) AS newTable ON departments.name = newTable.department_name;", function (error, results) {
        // Format the table a bit better
        // This is mostly to get better column names and to format dollar amounts
        let formatted = [];
        for (let i = 0; i < results.length; i++) {
            let obj = {
                ID: results[i].ID,
                "Department Name": results[i].Department_Name,
                "Overhead Costs": parseFloat(results[i].Overhead_Costs).toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                "Product Sales": parseFloat(results[i].Product_Sales).toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                "Total Sales": parseFloat(results[i].Total_Sales).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
            };
            formatted.push(obj);
        }

        // Display the table
        console.log("\n********************************************");
        console.table(formatted);
        console.log("********************************************\n");

        // Ask the user again what they would like to do
        start();
    });
}

// Creates a new department
function newDepartment() {
    inquirer.prompt([
        {
            name: "name",
            message: "What is the name of the new department?"
        }, {
            name: "overhead",
            message: "What is the Overhead Cost of the department (in dollars)?"
        }
    ]).then(function (answers) {
        // Format the answers into an object
        let insertThis = {
            name: answers.name,
            over_head_costs: parseFloat(answers.overhead)
        };
        // Query the database and create the object
        connection.query("INSERT INTO departments SET ?", insertThis, function (err, res) {
            if (err) throw err;
            console.log("\nThe new department " + answers.name + " has been created.\n");
            start();
        });
    });


}

function deleteDepartment() {
    connection.query("SELECT name FROM departments", function (err, res) {
        if (err) throw err;
        inquirer.prompt({
            name: "department",
            message: "Which department would you like to delete?",
            type: "rawlist",
            choices: function () {
                var choiceArray = [];
                for (var i = 0; i < res.length; i++) {
                    choiceArray.push(res[i].name);
                }
                return choiceArray;
            }
        }).then(function (answer) {
            let search = { department_name: answer.department };
            connection.query("SELECT product_name, price, stock_quantity,  department_name FROM products WHERE ?", search, function (error, results) {
                if (error) throw error;
                let formatted = [];
                for (let i = 0; i < results.length; i++) {
                    let obj = {
                        Product: results[i].product_name,
                        Price: parseFloat(results[i].price).toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                        Quantity: results[i].stock_quantity
                    };
                    formatted.push(obj);
                }
                console.log("\n********** " + answer.department + " **********");
                console.table(formatted);

                // Make sure the user is SURE they want to delete this product, since it can't be undone
                inquirer.prompt({
                    name: "response",
                    type: "rawlist",
                    message: "Are you sure you want to delete this department and its associated products? You can't undo this.",
                    choices: ["YES", "NO"]
                }).then(function (different) {
                    let productQuery = { department_name: answer.department };
                    let departmentQuery = { name: answer.department };
                    // If they did want to delete it, delete it
                    if (different.response.toUpperCase() === "YES") {
                        connection.query("DELETE FROM products WHERE ?", productQuery, function (err2, res2) {
                            if (err2) throw err2;
                            connection.query("DELETE FROM departments WHERE ?", departmentQuery, function (err3, res3) {
                                if (err3) throw err3;
                                console.log("\nAll products associated with the " + answer.department + " department have ben deleted, as well as the department.\n");
                                start();
                            });
                        });
                    } else {
                        console.log("\n" + answer.department + " has NOT been deleted.\n");

                        // Prompt user again
                        start();
                    }
                });
            });
        });
    });
}