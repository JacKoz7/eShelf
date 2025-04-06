const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Załaduj zmienne środowiskowe
dotenv.config();

// Połącz z bazą danych
connectDB();

// Inicjalizacja express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Definicja routes
app.use("/api/users", require("./routes/UserRoutes"));
app.use('/api/books', require("./routes/BookRoutes"));

// Route do testowania
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Port i uruchomienie serwera
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
