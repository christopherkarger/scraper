import { interactWithPage } from "./interact";

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.static("app/dist/my-scraper"));

app.post("/api/interact", interactWithPage);
app.listen(3000);
