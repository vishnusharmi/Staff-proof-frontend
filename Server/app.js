const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

app.use(express.json());

const port = 3000;

app.listen(port,()=>{
    console.log(`running on http://localhost:${port}`);
    
})