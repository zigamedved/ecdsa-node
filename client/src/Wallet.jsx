import server from "./server";
import {secp256k1} from "ethereum-cryptography/secp256k1"

import {toHex} from "ethereum-cryptography/utils"



function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    const privateKey = evt.target.value;
    
    if(!privateKey.length){
      setBalance(0);
      setPrivateKey("");
      setAddress("");
      return
    }

    setPrivateKey(privateKey)
    const address = secp256k1.getPublicKey(privateKey)
    setAddress(toHex(address));
    const {
      data: { balance },
    } = await server.get(`balance/${toHex(address)}`);
    setBalance(balance);
  
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private key
        <input placeholder="Type in your private key: " value={privateKey} onChange={onChange}></input>
      </label>

      <div>Public address: {address}</div>
      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;

// TODO
// - add additional fields on transaction component. Fields like sender transaction, (receiver) transaction, signature (and amount).
// - add generate signature component

// TODO server
// - validate signature etc..., add status code...
