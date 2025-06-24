const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const client = new MongoClient(process.env.MONGO_URL);
const dbName = 'passop';
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://password-manager-izgk.vercel.app/',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

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
    res.status(500).json({ error: "Failed to fetch passwords" });
  }
});

// POST new password
app.post('/api/passwords', async (req, res) => {
  try {
    const result = await db.collection('Passwords').insertOne(req.body);
    res.json({ ...req.body, _id: result.insertedId });
  } catch (err) {
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

    if (!result) {
      return res.status(404).json({ error: "Password not found" });
    }

    res.json({msg: "Password updated successfully"});
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// DELETE a password
app.delete('/api/passwords/:id', async (req, res) => {
  try {
    await db.collection('Passwords').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete password" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
