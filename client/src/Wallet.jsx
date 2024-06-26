import axios from 'axios';


function Wallet({ address, setAddress, balance, setBalance }) {
  async function onChange(evt) {
    const address = evt.target.value;
    setAddress(address);

    if(!address){
      setBalance(0);
    }else{
      const { data: { balance }} = await axios.get(`http://localhost:3042/balance/${address}`);
      setBalance(balance);
    }

  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
       Public address
        <input placeholder="Type in your public address key: " value={address} onChange={onChange}></input>
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;


