const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// middleware:-----
app.use(cors());
app.use(express.json());

// Mongo db initialize:-------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.htg77.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const productCollection = client.db("emaJhon").collection("product");
    // API for all product
    app.get("/product", async (req, res) => {
      console.log("query=", req.query);
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const query = {};
      const cursor = productCollection.find(query);
      let products;
      if (page || size) {
        // page:0---> skip: 0--> get:0-10
        // page:1---> skip: 1*10||(page no.*10)--> get:11-20
        // page:1---> skip: 2*10||(page no.*10)--> get:21-30
        products = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        products = await cursor.toArray();
      }
      res.send(products);
    });
    // Api for count Product :-------
    app.get("/productCount", async (req, res) => {
      const count = await productCollection.estimatedDocumentCount();
      res.send({ count });
    });
    // use post to get product by id====
    app.post("/productByKeys", async (req, res) => {
      const keys = req.body;
      const ids = keys.map((id) => ObjectId(id));
      const query = { _id: { $in: ids } };
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
      console.log(keys);
    });
  } finally {
  }
}
run().catch(console.dir);

// Initial endpoint:-------
app.get("/", (req, res) => {
  res.send("Welcomr To emazon Server");
});

app.listen(port, () => {
  console.log(`Running Port `, port);
});
