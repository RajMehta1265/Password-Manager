const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'passop';
const app = express();
const port = 3000;

// Enable CORS for your frontend origin
app.use(cors({
  origin: 'http://localhost:5173', // React frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

// Built-in middleware to parse JSON
app.use(express.json());

let db;

// Connect to MongoDB
client.connect()
  .then(() => {
    console.log("✅ Connected successfully to MongoDB");
    db = client.db(dbName);
  })
  .catch(err => {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  });

// GET all passwords
app.get('/', async (req, res) => {
  try {
    const collection = db.collection('Passwords');
    const findResult = await collection.find({}).toArray();
    const passwordsOnly = findResult.map(doc => doc.passwords); // return only passwords object
    res.json(passwordsOnly);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch passwords" });
  }
});

// POST (save a password)
app.post('/', async (req, res) => {
  try {
    const input = req.body;
    const passwordDocument = { passwords: input };
    const collection = db.collection('Passwords');
    const result = await collection.insertOne(passwordDocument);
    res.send({ success: true, result });
  } catch (err) {
    res.status(500).send({ error: "Failed to save password" });
  }
});

// PUT (update a password)
app.put('/', async (req, res) => {
  try {
    const { site, username, password } = req.body;
    const collection = db.collection('Passwords');
    const result = await collection.updateOne(
      { "passwords.site": site, "passwords.username": username },
      { $set: { "passwords.password": password } }
    );
    res.send({ success: true, result });
  } catch (err) {
    res.status(500).send({ error: "Failed to update password" });
  }
});

// DELETE a password
app.delete('/', async (req, res) => {
  try {
    const { site, username } = req.body;
    const collection = db.collection('Passwords');
    const result = await collection.deleteOne({
      "passwords.site": site,
      "passwords.username": username
    });
    res.send({ success: true, result });
  } catch (err) {
    res.status(500).send({ error: "Failed to delete password" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Password Manager backend running at http://localhost:${port}`);
});
