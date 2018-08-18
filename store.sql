DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
    id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) default 0,
    stock_quantity INT default 0,
    department_name VARCHAR(100) NOT NULL,
    
    PRIMARY KEY (id)
);

INSERT INTO products (product_name, stock_quantity, department_name, price)
VALUES ("Classes dice tray", 2, "Dice Trays", 15.50), ("Bard Earrings", 5, "Jewelry", 10), ("Dice Set Necklace", 3, "Jewelry", 8), ("Disguise Self", 10, "Spell Cards", 6), ("Warlock Earrings", 8, "Jewelry", 10), ("Druidcraft", 16, "Spell Cards", 6), ("Wish", 2, "Spell Cards", 6), ("Poisoned", 20, "Condition Rings", 1), ("Invisible", 20, "Condition Rings", 1), ("Acrylic Gameboard", 1, "Special Products", 40);