import { useState } from "react";
import server from "./server";

import * as secp from "ethereum-cryptography/secp256k1"
import { keccak256 } from "ethereum-cryptography/keccak"
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils"


function hashMessage(address,recipient, amount){
return toHex(keccak256(utf8ToBytes(JSON.stringify({address,recipient,amount}))))
}

async function getSignature(hashedMessage, privateKey){
  const signature = await secp.sign(hashedMessage, privateKey, {recovered: true})
  return signature
}

function Transfer({}) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKey, setPrivateKey] = useState("")

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const address = toHex(secp.getPublicKey(privateKey, true))
    const hashedMessage = hashMessage(address, recipient, parseInt(sendAmount))
    const signature = await getSignature(hashedMessage, privateKey)
  
    try {
      await server.post(`send`, {
        address,
        recipient: recipient,
        amount: parseInt(sendAmount),
        signature,
        hashedMessage,
      });
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Your private key (needed to sign transaction, won't be saved :D)
        <input
          placeholder="..."
          value={privateKey}
          onChange={setValue(setPrivateKey)}
        ></input>
      </label>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
