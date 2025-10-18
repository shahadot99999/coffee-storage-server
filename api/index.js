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


//......................

const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// 1. Initialize Express App
const app = express();
// The port is only used for local development, Vercel ignores it in serverless mode.
const port = process.env.PORT || 3000; 

// midleware
app.use(cors());
app.use(express.json());

// --- MongoDB Setup for Serverless Environment ---

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wr5mswb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Cache the connection and collections globally to reuse them across function invocations (cold starts).
let isConnected = false;
let coffeesCollection;
let usersCollection;

async function connectDB() {
    // If already connected, return immediately.
    if (isConnected && coffeesCollection && usersCollection) {
        // console.log("Using existing database connection.");
        return;
    }
  
    try {
        await client.connect();
        
        // Initialize collections after a successful connection
        coffeesCollection = client.db('coffeeDB').collection('coffees');
        usersCollection = client.db('coffeeDB').collection('users');
        
        isConnected = true;
        
        // Optional: Ping to confirm connection (can be removed for faster cold start)
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged deployment. Successfully connected to MongoDB!");

    } catch (error) {
        console.error("MongoDB connection error:", error);
        isConnected = false;
        // Do NOT re-throw or exit the process here. Vercel handles errors differently.
        throw new Error("Failed to connect to the database.");
    }
}

// Global connection attempt. Vercel's execution model will run this on cold start.
connectDB().catch(err => console.error("Initial DB connection failed:", err.message));


// A simple middleware to ensure connection is checked on every request.
// This handles the first request during a cold start if the initial connectDB() hasn't finished.
app.use(async (req, res, next) => {
    try {
        await connectDB();
        if (isConnected) {
            next();
        } else {
            res.status(503).send({ error: "Service Unavailable: Database connection failed." });
        }
    } catch (error) {
        res.status(503).send({ error: "Service Unavailable: Database initialization error." });
    }
});


// --- API Routes ---

// Root route
app.get('/', (req, res) => {
    // We can assume isConnected is true here due to the middleware, but it's a good status check.
    res.send(`✅ Coffee server is running! Database: ${isConnected ? 'Connected' : 'Error/Connecting...'}`);
});


// get all coffees
app.get('/coffees', async(req, res) => {
    try {
        const result = await coffeesCollection.find().toArray();
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to fetch coffees." });
    }
});


// get single coffee by id
app.get('/coffees/:id', async(req, res) => {
    const id = req.params.id;
    try {
        const query = {_id: new ObjectId(id)}
        const result = await coffeesCollection.findOne(query);
        res.send(result);
    } catch (e) {
        // This catches if the ID format is invalid for ObjectId
        res.status(400).send({ error: "Invalid ID format or failed to find resource." });
    }
});

// post data
app.post('/coffees', async(req, res) => {
    const newCoffee = req.body;
    console.log(newCoffee);
    const result = await coffeesCollection.insertOne(newCoffee);
    res.send(result);
});


// Update data
app.put('/coffees/:id', async(req,res) => {
    const id = req.params.id;
    try {
        const filter = {_id: new ObjectId(id)}
        const options = { upsert : true};
        const updatedCoffee = req.body;
        const updatedDoc = {
            $set: updatedCoffee
        }

        const result = await coffeesCollection.updateOne(filter, updatedDoc, options);
        res.send(result);
    } catch (e) {
        res.status(400).send({ error: "Invalid ID format or failed to update." });
    }
});


// post data deleted
app.delete('/coffees/:id', async(req, res) => {
    const id = req.params.id;
    try {
        const query = {_id: new ObjectId(id)}       
        const result = await coffeesCollection.deleteOne(query);
        res.send(result);
    } catch (e) {
        res.status(400).send({ error: "Invalid ID format or failed to delete." });
    }
});


// user related apis
app.get('/users', async(req, res) => {
    const result = await usersCollection.find().toArray();
    res.send(result);
});

app.post('/users', async(req, res) => {
    const userProfile = req.body;
    console.log(userProfile);
    const result = await usersCollection.insertOne(userProfile);
    res.send(result);
});

app.patch('/users', async(req, res) => {
    const {email, lastSignInTime}= req.body;
    const filter = {email: email}
    const updatedDoc = {
        $set: {
            lastSignInTime: lastSignInTime
        }
    }

    const result = await usersCollection.updateOne(filter, updatedDoc)
    res.send(result);
});


app.delete('/users/:id', async(req, res) => {
    const id = req.params.id;
    try {
        const query = {_id: new ObjectId(id)}
        const result = await usersCollection.deleteOne(query);
        res.send(result);
    } catch (e) {
        res.status(400).send({ error: "Invalid ID format or failed to delete user." });
    }
});


// 2. CRITICAL CHANGE: Export the Express app instance.
// This is how Vercel's serverless builder takes control of handling requests.
module.exports = app;