import express from "express";
import { matchRouter } from "./src/routes/matches.js";
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/matches",matchRouter);

app.listen(4000, () => {
  console.log("Server is running on port http://localhost:4000");
});
