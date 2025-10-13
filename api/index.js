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
//.............................................

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection for serverless (Vercel)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wr5mswb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

let client;
let coffeesCollection;
let usersCollection;

async function connectDB() {
  if (client && client.topology && client.topology.isConnected()) {
    return { coffeesCollection, usersCollection };
  }

  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  try {
    await client.connect();
    const db = client.db('coffeeDB');
    coffeesCollection = db.collection('coffees');
    usersCollection = db.collection('users');
    console.log('✅ MongoDB connected successfully on Vercel!');
    return { coffeesCollection, usersCollection };
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

// ✅ Root endpoint
app.get('/', (req, res) => {
  res.send('✅ Coffee Storage Server is running on Vercel!');
});

// ✅ Get all coffees
app.get('/coffees', async (req, res) => {
  try {
    const { coffeesCollection } = await connectDB();
    const result = await coffeesCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error('❌ Failed to fetch coffees:', error);
    res.status(500).send({ error: 'Failed to fetch coffees' });
  }
});

// ✅ Get single coffee
app.get('/coffees/:id', async (req, res) => {
  try {
    const { coffeesCollection } = await connectDB();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await coffeesCollection.findOne(query);
    res.send(result);
  } catch (error) {
    console.error('❌ Failed to fetch coffee:', error);
    res.status(500).send({ error: 'Failed to fetch coffee' });
  }
});

// ✅ Add new coffee
app.post('/coffees', async (req, res) => {
  try {
    const { coffeesCollection } = await connectDB();
    const newCoffee = req.body;
    const result = await coffeesCollection.insertOne(newCoffee);
    res.send(result);
  } catch (error) {
    console.error('❌ Failed to add coffee:', error);
    res.status(500).send({ error: 'Failed to add coffee' });
  }
});

// ✅ Update coffee
app.put('/coffees/:id', async (req, res) => {
  try {
    const { coffeesCollection } = await connectDB();
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updatedCoffee = req.body;
    const updatedDoc = {
      $set: updatedCoffee
    };
    const result = await coffeesCollection.updateOne(filter, updatedDoc, options);
    res.send(result);
  } catch (error) {
    console.error('❌ Failed to update coffee:', error);
    res.status(500).send({ error: 'Failed to update coffee' });
  }
});

// ✅ Delete coffee
app.delete('/coffees/:id', async (req, res) => {
  try {
    const { coffeesCollection } = await connectDB();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await coffeesCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.error('❌ Failed to delete coffee:', error);
    res.status(500).send({ error: 'Failed to delete coffee' });
  }
});

// ✅ User endpoints
app.get('/users', async (req, res) => {
  try {
    const { usersCollection } = await connectDB();
    const result = await usersCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error('❌ Failed to fetch users:', error);
    res.status(500).send({ error: 'Failed to fetch users' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { usersCollection } = await connectDB();
    const userProfile = req.body;
    const result = await usersCollection.insertOne(userProfile);
    res.send(result);
  } catch (error) {
    console.error('❌ Failed to add user:', error);
    res.status(500).send({ error: 'Failed to add user' });
  }
});

app.patch('/users', async (req, res) => {
  try {
    const { usersCollection } = await connectDB();
    const { email, lastSignInTime } = req.body;
    const filter = { email: email };
    const updatedDoc = {
      $set: {
        lastSignInTime: lastSignInTime
      }
    };
    const result = await usersCollection.updateOne(filter, updatedDoc);
    res.send(result);
  } catch (error) {
    console.error('❌ Failed to update user:', error);
    res.status(500).send({ error: 'Failed to update user' });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const { usersCollection } = await connectDB();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await usersCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.error('❌ Failed to delete user:', error);
    res.status(500).send({ error: 'Failed to delete user' });
  }
});

// ✅ Export for Vercel
module.exports = app;

// .....................................


// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();
// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ✅ Database connection setup
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wr5mswb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// let coffeesCollection, usersCollection;

// // Connect once (for serverless it will be cached)
// async function connectDB() {
//   try {
//     if (!client.topology?.isConnected()) {
//       await client.connect();
//       console.log("✅ MongoDB Connected Successfully!");
//     }
//     const db = client.db("coffeeDB"); // change if your DB name differs
//     coffeesCollection = db.collection("coffees");
//     usersCollection = db.collection("users");
//   } catch (error) {
//     console.error("❌ MongoDB Connection Error:", error);
//   }
// }
// connectDB();

// // 🧭 Default route
// app.get("/", (req, res) => {
//   res.send("☕ Coffee Storage Server is running on Vercel!");
// });

// // =======================
// // ☕ Coffee APIs
// // =======================

// app.get("/coffees", async (req, res) => {
//   try {
//     const result = await coffeesCollection.find().toArray();
//     res.send(result);
//   } catch (err) {
//     res.status(500).send({ error: "Failed to fetch coffees" });
//   }
// });

// app.get("/coffees/:id", async (req, res) => {
//   try {
//     const id = req.params.id;
//     const result = await coffeesCollection.findOne({ _id: new ObjectId(id) });
//     res.send(result);
//   } catch (err) {
//     res.status(500).send({ error: "Invalid ID or fetch failed" });
//   }
// });

// app.post("/coffees", async (req, res) => {
//   try {
//     const newCoffee = req.body;
//     const result = await coffeesCollection.insertOne(newCoffee);
//     res.send(result);
//   } catch (err) {
//     res.status(500).send({ error: "Insert failed" });
//   }
// });

// app.put("/coffees/:id", async (req, res) => {
//   try {
//     const id = req.params.id;
//     const updatedCoffee = req.body;
//     const result = await coffeesCollection.updateOne(
//       { _id: new ObjectId(id) },
//       { $set: updatedCoffee },
//       { upsert: true }
//     );
//     res.send(result);
//   } catch (err) {
//     res.status(500).send({ error: "Update failed" });
//   }
// });

// app.delete("/coffees/:id", async (req, res) => {
//   try {
//     const id = req.params.id;
//     const result = await coffeesCollection.deleteOne({ _id: new ObjectId(id) });
//     res.send(result);
//   } catch (err) {
//     res.status(500).send({ error: "Delete failed" });
//   }
// });

// // =======================
// // 👤 User APIs
// // =======================

// app.get("/users", async (req, res) => {
//   try {
//     const result = await usersCollection.find().toArray();
//     res.send(result);
//   } catch (err) {
//     res.status(500).send({ error: "Failed to fetch users" });
//   }
// });

// app.post("/users", async (req, res) => {
//   try {
//     const userProfile = req.body;
//     const result = await usersCollection.insertOne(userProfile);
//     res.send(result);
//   } catch (err) {
//     res.status(500).send({ error: "User insert failed" });
//   }
// });

// app.patch("/users", async (req, res) => {
//   try {
//     const { email, lastSignInTime } = req.body;
//     const result = await usersCollection.updateOne(
//       { email },
//       { $set: { lastSignInTime } }
//     );
//     res.send(result);
//   } catch (err) {
//     res.status(500).send({ error: "User update failed" });
//   }
// });

// app.delete("/users/:id", async (req, res) => {
//   try {
//     const id = req.params.id;
//     const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
//     res.send(result);
//   } catch (err) {
//     res.status(500).send({ error: "User delete failed" });
//   }
// });

// // ✅ Export for Vercel (no app.listen)
// module.exports = app;

// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();
// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ✅ Database connection
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wr5mswb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// let client;
// let coffeeCollection;
// let usersCollection;

// // ✅ Reuse MongoDB connection across requests (Vercel-friendly)
// async function connectDB() {
//   if (client && client.topology && client.topology.isConnected()) {
//     return client;
//   }

//   client = new MongoClient(uri, {
//     serverApi: {
//       version: ServerApiVersion.v1,
//       strict: true,
//       deprecationErrors: true,
//     },
//   });

//   try {
//     await client.connect();
//     const db = client.db("coffeeDB");
//     coffeeCollection = db.collection("coffees");
//     usersCollection = db.collection("users");
//     console.log("✅ MongoDB connected successfully!");
//   } catch (error) {
//     console.error("❌ MongoDB connection failed:", error);
//   }

//   return client;
// }

// // ✅ Root route
// app.get("/", (req, res) => {
//   res.send("☕ Coffee Storage Server is running on Vercel!");
// });

// // ✅ Get all coffees
// app.get("/coffees", async (req, res) => {
//   try {
//     await connectDB();
//     const result = await coffeeCollection.find().toArray();
//     res.send(result);
//   } catch (error) {
//     console.error("❌ Failed to fetch coffees:", error);
//     res.status(500).send({ error: "Failed to fetch coffees" });
//   }
// });

// // ✅ Get one coffee by ID
// app.get("/coffees/:id", async (req, res) => {
//   try {
//     await connectDB();
//     const id = req.params.id;
//     const coffee = await coffeeCollection.findOne({ _id: new ObjectId(id) });
//     res.send(coffee);
//   } catch (error) {
//     console.error("❌ Failed to fetch coffee:", error);
//     res.status(500).send({ error: "Failed to fetch coffee" });
//   }
// });

// // ✅ Add a new coffee
// app.post("/coffees", async (req, res) => {
//   try {
//     await connectDB();
//     const newCoffee = req.body;
//     const result = await coffeeCollection.insertOne(newCoffee);
//     res.send(result);
//   } catch (error) {
//     console.error("❌ Failed to add coffee:", error);
//     res.status(500).send({ error: "Failed to add coffee" });
//   }
// });

// // ✅ Update a coffee
// app.put("/coffees/:id", async (req, res) => {
//   try {
//     await connectDB();
//     const id = req.params.id;
//     const updatedCoffee = req.body;
//     const result = await coffeeCollection.updateOne(
//       { _id: new ObjectId(id) },
//       { $set: updatedCoffee }
//     );
//     res.send(result);
//   } catch (error) {
//     console.error("❌ Failed to update coffee:", error);
//     res.status(500).send({ error: "Failed to update coffee" });
//   }
// });

// // ✅ Delete a coffee
// app.delete("/coffees/:id", async (req, res) => {
//   try {
//     await connectDB();
//     const id = req.params.id;
//     const result = await coffeeCollection.deleteOne({ _id: new ObjectId(id) });
//     res.send(result);
//   } catch (error) {
//     console.error("❌ Failed to delete coffee:", error);
//     res.status(500).send({ error: "Failed to delete coffee" });
//   }
// });

// // ✅ User endpoints
// app.get("/users", async (req, res) => {
//   try {
//     await connectDB();
//     const result = await usersCollection.find().toArray();
//     res.send(result);
//   } catch (error) {
//     console.error("❌ Failed to fetch users:", error);
//     res.status(500).send({ error: "Failed to fetch users" });
//   }
// });

// app.post("/users", async (req, res) => {
//   try {
//     await connectDB();
//     const newUser = req.body;
//     const result = await usersCollection.insertOne(newUser);
//     res.send(result);
//   } catch (error) {
//     console.error("❌ Failed to add user:", error);
//     res.status(500).send({ error: "Failed to add user" });
//   }
// });

// app.patch("/users", async (req, res) => {
//   try {
//     await connectDB();
//     const { email, lastSignInTime } = req.body;
//     const result = await usersCollection.updateOne(
//       { email },
//       { $set: { lastSignInTime } }
//     );
//     res.send(result);
//   } catch (error) {
//     console.error("❌ Failed to update user:", error);
//     res.status(500).send({ error: "Failed to update user" });
//   }
// });

// app.delete("/users/:id", async (req, res) => {
//   try {
//     await connectDB();
//     const id = req.params.id;
//     const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
//     res.send(result);
//   } catch (error) {
//     console.error("❌ Failed to delete user:", error);
//     res.status(500).send({ error: "Failed to delete user" });
//   }
// });

// // ✅ Export the app for Vercel
// module.exports = app;

