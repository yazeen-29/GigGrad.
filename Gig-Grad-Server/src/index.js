require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// Load routes one by one with error catching
const routes = [
  { path: "/api/auth",         file: "./routes/auth"         },
  { path: "/api/jobs",         file: "./routes/jobs"         },
  { path: "/api/applications", file: "./routes/applications" },
  { path: "/api/users",        file: "./routes/users"        },
  { path: "/api/disputes",     file: "./routes/disputes"     },
];

routes.forEach(({ path, file }) => {
  try {
    app.use(path, require(file));
    console.log(`✅ Loaded ${file}`);
  } catch (err) {
    console.error(`❌ Failed to load ${file}:`, err.message);
  }
});

app.get("/", (req, res) => res.json({ status: "GigGrad API running ✓" }));

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server at http://localhost:${PORT}\n`);
});