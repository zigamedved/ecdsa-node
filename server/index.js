const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const { toHex, utf8ToBytes} = require("ethereum-cryptography/utils");
const secp = require("ethereum-cryptography/secp256k1");

const { keccak256 } = require("ethereum-cryptography/keccak");

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
  console.info(`Requested address: ${req.params.address} has balance: ${balance} `)
  res.send({ balance });
});
 
function hashMessage(address,recipient, amount){
  return toHex(keccak256(utf8ToBytes(JSON.stringify({address,recipient,amount}))))
}

app.post("/send", async (req, res) => {
  const { address, recipient, amount, signature, hashedMessage } = req.body;
  
  const localHash = hashMessage(address, recipient, amount)
  if (localHash != hashedMessage){
    res.status(406).send({ message: "Provided hash does not match the locally calculated one!" });
    return
  } 
  console.info("Great, calculated hash matches the provided one, going to the next step...")

  const sig = Uint8Array.from(Object.values(signature[0]))
  const recoveryBit = signature[1]
  const publicKey =  secp.recoverPublicKey(hashedMessage, sig, recoveryBit)
  const verified = secp.verify(sig, hashedMessage, publicKey)

  if ((!verified || !(address.slice(2)==toHex(publicKey.slice(1,33))))){
    res.status(406).send({ message: "Wrong signature!" });
    return
  }

  setInitialBalance(address);
  setInitialBalance(recipient);

  if (balances[address] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[address] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[address] });
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