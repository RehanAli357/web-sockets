import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(4000, () => {
  console.log("Server is running on port http://localhost:4000");
});
