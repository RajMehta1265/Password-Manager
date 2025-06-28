const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const client = new MongoClient(process.env.MONGO_URL);
const dbName = 'passop';
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json()); // ✅ Enables req.body parsing

// Connect to MongoDB
let db;
client.connect().then(() => {
  db = client.db(dbName);
  console.log("✅ MongoDB connected");
}).catch(err => {
  console.error("❌ MongoDB connection failed:", err);
  process.exit(1);
});

// GET all passwords
app.get('/api/passwords', async (req, res) => {
  try {
    const passwords = await db.collection('Passwords').find().toArray();
    res.json(passwords);
  } catch (err) {
    console.error("GET Error:", err);
    res.status(500).json({ error: "Failed to fetch passwords" });
  }
});

// POST new password
app.post('/api/passwords', async (req, res) => {
  try {
    const { site, username, password } = req.body;

    if (!site || !username || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const result = await db.collection('Passwords').insertOne({ site, username, password });

    if (!result.insertedId) {
      return res.status(500).json({ error: "Insert failed." });
    }

    res.status(201).json({ _id: result.insertedId, site, username, password });
  } catch (err) {
    console.error("POST Error:", err);
    res.status(500).json({ error: "Failed to add password" });
  }
});

// PUT update password
app.put('/api/passwords/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const { _id, ...safeData } = req.body;

    const result = await db.collection('Passwords').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: safeData },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ error: "Password not found" });
    }

    res.json(result.value);
  } catch (err) {
    console.error("PUT Error:", err);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// DELETE a password
app.delete('/api/passwords/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const result = await db.collection('Passwords').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Password not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE Error:", err);
    res.status(500).json({ error: "Failed to delete password" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
