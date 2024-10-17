const express = require('express');
const bodyParser = require('body-parser');
var mysql = require('mysql');

// Create express app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Set CORS headers
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE"
    );
    next();
});

app.use(express.json());

// MySQL connection
var con = mysql.createConnection({
    host: "korawit.ddns.net",
    user: "webapp",
    password: "secret2024",
    port: 3307,
    database: "shop"
});

con.connect(function(err) {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

// GET all products
app.get('/api/products', function(req, res) {
    con.query("SELECT * FROM products", function(err, result, fields) {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).send('Error fetching products');
        }
        res.send(result);
    });
});

// GET product by ID
app.get('/api/products/:id', function(req, res) {
    const id = req.params.id;
    con.query("SELECT * FROM products where id = "+id, function(err, result,fields) {
        if (err) throw err;
        let product = result;
        if (product.length > 0) {
            res.send(product);
        } else {
            res.status(404).send("Not Found product for "+ id);
        }
        console.log(result);
    });
});

// DELETE product by ID
app.delete('/api/delProduct/:id', function(req, res) {
    const id = req.params.id;
    const sql = "DELETE FROM products WHERE id = ?";
    con.query(sql, [id], function(err, result) {
        if (err) {
            console.error("Error deleting product:", err);
            return res.status(400).send('Error deleting product');
        }
        if (result.affectedRows > 0) {
            con.query("SELECT * FROM products", function(err, result, fields) {
                if (err) {
                    console.error("Error fetching products after delete:", err);
                    return res.status(500).send('Error fetching products after delete');
                }
                res.send(result);
            });
        } else {
            res.status(404).send('Product not found');
        }
    });
});



app.post('/api/addproduct', function(req, res){
    const name=req.body.name;
    const price=req.body.price;
    const img=req.body.img;
    console.log(name, price, img);
    var sql = `INSERT INTO products (name, price,img) VALUES ('${name}', '${price}','${img}')`;

    con.query(sql, function(err, result) {
        if (err) throw res.status(400).send('Error cannot add product');
        console.log("1 record inserted");
        con.query("SELECT * FROM products", function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            res.send(result);
        });
    });
});

app.put('/api/updateProduct/:id', function(req, res){
    const id = req.params.id;
    const name=req.body.name;
    const price=req.body.price;
    const img = req.body.img;
    var sql = `UPDATE products SET name = '${name}', price='${price}'. img='${img}' WHERE id = ${id}`;
    console.log(sql);
    con.query(sql, function (err, result) {
        if (err) throw res.status(400).send('Error cannot update student');
        con.query("SELECT * FROM products", function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            res.send(result);
        });
    });
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


