// const express = require('express');
// const cors = require('cors');
// require('dotenv').config()
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const app = express();
// const port = process.env.PORT || 3000;





// //midleware
// app.use(cors());
// app.use(express.json());





// // console.log(process.env.DB_USER);
// // console.log(process.env.DB_PASS);

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wr5mswb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// //const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.wr5mswb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();

//     const coffeesCollection = client.db('coffeeDB').collection('coffees')
//     const usersCollection = client.db('coffeeDB').collection('users')
    


//     //get data from post data..when input some data its show in get data
//     app.get('/coffees', async(req, res)=>{
//       const result = await coffeesCollection.find().toArray();
//       res.send(result);
//     })


//     //get data from find ...
//     app.get('/coffees/:id', async(req, res)=>{
//       const id = req.params.id;
//       const query = {_id: new ObjectId(id)}
//       const result = await coffeesCollection.findOne(query);
//       res.send(result);
//     })

//     //post data...when apply something its show in post data.
//     app.post('/coffees', async(req, res)=>{
//       const newCoffee = req.body;
//       console.log(newCoffee);
//       const result = await coffeesCollection.insertOne(newCoffee);
//       res.send(result)

//     })


//     //Update data are show  in database
//     app.put('/coffees/:id', async(req,res)=>{
//       const id = req.params.id;
//       const filter = {_id: new ObjectId(id)}
//       const options = { upsert : true};
//       const updatedCoffee = req.body;
//       const updatedDoc = {
//         $set: updatedCoffee
//       }

//       const result = await coffeesCollection.updateOne(filter, updatedDoc, options);
//       res.send(result);
//     })


//     //post data deleted..
//     app.delete('/coffees/:id', async(req, res)=>{
//      const id = req.params.id;
//      const query = {_id: new ObjectId(id)}      
//      const result = await coffeesCollection.deleteOne(query);
//      res.send(result);

//     })


//     //user related apis
//     app.get('/users', async(req, res)=>{
//       const result = await usersCollection.find().toArray();
//       res.send(result);
//     })

//     app.post('/users', async(req, res)=>{
//       const userProfile = req.body;
//       console.log(userProfile);
//       const result = await usersCollection.insertOne(userProfile);
//       res.send(result);
//     })

//     app.patch('/users', async(req, res)=>{
//       //console.log(req.body);
//       const {email, lastSignInTime}= req.body;
//       const filter = {email: email}
//       const updatedDoc = {
//         $set: {
//           lastSignInTime: lastSignInTime
//         }
//       }

//       const result = await usersCollection.updateOne(filter, updatedDoc)
//       res.send(result);

//     })


//     app.delete('/users/:id', async(req, res)=>{
//       const id = req.params.id;
//       const query = {_id: new ObjectId(id)}
//       const result = await usersCollection.deleteOne(query);
//       res.send(result);
//     })


    
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);


// app.get('/', (req, res) => {
//   // res.send('Coffe server is getting start!')
//    res.send('✅ Coffee server is running! Database: ' + (isDatabaseConnected ? 'Connected' : 'Connecting...'))
// })

// app.listen(port, () => {
//   console.log(`Coffee server is running  on port ${port}`)
// })


const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Database connection setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wr5mswb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let coffeesCollection, usersCollection;

// Connect once (for serverless it will be cached)
async function connectDB() {
  try {
    if (!client.topology?.isConnected()) {
      await client.connect();
      console.log("✅ MongoDB Connected Successfully!");
    }
    const db = client.db("coffeeDB"); // change if your DB name differs
    coffeesCollection = db.collection("coffees");
    usersCollection = db.collection("users");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
}
connectDB();

// 🧭 Default route
app.get("/", (req, res) => {
  res.send("☕ Coffee Storage Server is running on Vercel!");
});

// =======================
// ☕ Coffee APIs
// =======================

app.get("/coffees", async (req, res) => {
  try {
    const result = await coffeesCollection.find().toArray();
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch coffees" });
  }
});

app.get("/coffees/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await coffeesCollection.findOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "Invalid ID or fetch failed" });
  }
});

app.post("/coffees", async (req, res) => {
  try {
    const newCoffee = req.body;
    const result = await coffeesCollection.insertOne(newCoffee);
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "Insert failed" });
  }
});

app.put("/coffees/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedCoffee = req.body;
    const result = await coffeesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedCoffee },
      { upsert: true }
    );
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "Update failed" });
  }
});

app.delete("/coffees/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await coffeesCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "Delete failed" });
  }
});

// =======================
// 👤 User APIs
// =======================

app.get("/users", async (req, res) => {
  try {
    const result = await usersCollection.find().toArray();
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch users" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const userProfile = req.body;
    const result = await usersCollection.insertOne(userProfile);
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "User insert failed" });
  }
});

app.patch("/users", async (req, res) => {
  try {
    const { email, lastSignInTime } = req.body;
    const result = await usersCollection.updateOne(
      { email },
      { $set: { lastSignInTime } }
    );
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "User update failed" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "User delete failed" });
  }
});

// ✅ Export for Vercel (no app.listen)
module.exports = app;
