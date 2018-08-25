DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
    id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) default 0,
    stock_quantity INT default 0,
    department_name VARCHAR(100) NOT NULL,
    product_sales DECIMAL(10,2) DEFAULT 0,

    PRIMARY KEY (id)
);

CREATE TABLE departments(
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    over_head_costs INT DEFAULT 100,

    PRIMARY KEY (id)
);

INSERT INTO products (product_name, stock_quantity, department_name, price)
VALUES ("Classes dice tray", 2, "Dice Trays", 15.50), ("Bard Earrings", 5, "Jewelry", 10), ("Dice Set Necklace", 3, "Jewelry", 8), ("Disguise Self", 10, "Spell Cards", 6), ("Warlock Earrings", 8, "Jewelry", 10), ("Druidcraft", 16, "Spell Cards", 6), ("Wish", 2, "Spell Cards", 6), ("Poisoned", 20, "Condition Rings", 1), ("Invisible", 20, "Condition Rings", 1), ("Acrylic Gameboard", 1, "Special Products", 40);


INSERT INTO departments (name, over_head_costs)
VALUES ("Dice Trays", 150), ("Jewelry", 200), ("Spell Cards", 80), ("Special Products", 300), ("Condition Rings", 80);




SELECT * FROM products;
SELECT sum(product_sales) AS Product_Sales, department_name
FROM products
GROUP BY department_name;

SELECT id AS ID, name AS Department_Name, over_head_costs AS Overhead_Costs 
FROM departments;

SELECT id AS ID, name AS Department_Name, over_head_costs AS Overhead_Costs, Product_Sales
FROM departments
INNER JOIN (SELECT sum(product_sales) AS Product_Sales, department_name
FROM products
GROUP BY department_name) AS newTable ON departments.name = newTable.department_name;

SELECT ((products.product_sales * products.price)-departments.over_head_costs) AS Total_Sales
FROM products, departments;

SELECT sum(products.product_sales * products.price)-departments.over_head_costs AS Sales, department_name
FROM products, departments
GROUP BY department_name;


SELECT sum(product_sales) as Product_Sales, department_name
FROM products
GROUP BY department_name;
