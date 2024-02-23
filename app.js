const express = require("express");
const app = express();
const searchItem = require("./searchItem");

const PORT = 3000;

async function serverStart() {
  try {
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    app.use(searchItem);

    app.listen(PORT, () => {
      console.log("Server established at port " + PORT);
    });
  } catch (err) {
    console.log(err);
  }
}

serverStart();
