const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection (use MongoDB Atlas or local MongoDB)
mongoose.connect("mongodb+srv://<username>:<password>@cluster.mongodb.net/taptoearn", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// User schema
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  balance: { type: Number, default: 0 }
});
const User = mongoose.model("User", UserSchema);

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { username } = req.body;
    if (await User.findOne({ username })) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = new User({ username });
    await user.save();
    res.json({ message: "Account created!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// Tap to earn
app.post("/earn", async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: "User not found" });
  user.balance += 5;
  await user.save();
  res.json(user);
});

// Withdraw
app.post("/withdraw", async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.balance < 50) return res.status(400).json({ message: "Minimum ₦50 required" });
  user.balance = 0;
  await user.save();
  res.json({ message: "Withdrawal successful!", balance: user.balance });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
