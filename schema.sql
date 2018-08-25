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