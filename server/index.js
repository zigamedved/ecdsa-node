const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "033b17fd2c4a20d88eb1ec7cbdeded2bd38a6229264d0c6c9167bce0a089eca15d": 100,
  "0394e071a4d7202dfd19fca18aaa97ae5a18c92bbecd0991b62acac8b33e154bb7": 50,
  "02b9231e4e1e380343f2389dbd8cead1863cca4797cdfd85cda5aca1f3bc82eaed": 75,
};

app.get("/balance/:address", (req, res) => {
  console.info(req.url)
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;
  // TODO get a signature from the client side application
  // recover the public address from the signature

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}


// recover public key from that signature 