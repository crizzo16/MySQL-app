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