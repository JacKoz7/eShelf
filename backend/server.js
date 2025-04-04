const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("testowanie tego dziadostwa");
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
