import express from 'express';
import cors from "cors";
import "dotenv/config";

import { getCollections } from "./database.js";

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

const { users } = await getCollections();
console.log("You successfully connected to MongoDB!");


app.get('/', (req, res) => {
    res.send('Wedplan is looping!');
});

app.get('/users', async (req, res) => {
    const cursor = users.find({});
    const result = await cursor.toArray();
    res.send(result);
})


app.listen(port, () => {
    console.log(`Wedplan app listening on port ${port}`);
});