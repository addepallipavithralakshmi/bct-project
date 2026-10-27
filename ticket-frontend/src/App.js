import React, { useState } from "react";
import Web3 from "web3";
import Tickets from "./contracts/Tickets.json";

function App() {

  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [role, setRole] = useState("");

  const [eventId, setEventId] = useState("");
  const [seats, setSeats] = useState("");
  const [price, setPrice] = useState("");

  const [ticketId, setTicketId] = useState("");
  const [bookEventId, setBookEventId] = useState("");

  const [verifyId, setVerifyId] = useState("");
  const [seatsLeft, setSeatsLeft] = useState("");

  const [ticketData, setTicketData] = useState(null);

  // 🎨 UI STYLES
  const card = {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  };

  const input = {
    padding: "10px",
    margin: "5px",
    borderRadius: "5px",
    border: "1px solid #ccc"
  };

  const button = {
    padding: "10px 15px",
    margin: "5px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#3498db",
    color: "white",
    cursor: "pointer"
  };

  // 🔗 CONNECT
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not found. Please install MetaMask.");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      // Web3 v4 returns BigInt — convert to string for network lookup
      const networkId = (await web3.eth.net.getId()).toString();
      const deployedNetwork = Tickets.networks[networkId];

      if (!deployedNetwork) {
        alert(`Contract not found on network ${networkId}. Make sure Ganache is running and contracts are deployed.`);
        return;
      }

      const instance = new web3.eth.Contract(
        Tickets.abi,
        deployedNetwork.address
      );

      setContract(instance);

      const admin = await instance.methods.admin().call();
      const verifier = await instance.methods.verifier().call();

      if (accounts[0].toLowerCase() === admin.toLowerCase()) {
        setRole("ADMIN 👑");
      } else if (accounts[0].toLowerCase() === verifier.toLowerCase()) {
        setRole("VERIFIER 🎯");
      } else {
        setRole("USER 👤");
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
      alert("Connection failed: " + err.message);
    }
  };

  // 🎉 CREATE EVENT
  const createEvent = async () => {
    try {
      await contract.methods
        .createEvent(eventId, seats, Web3.utils.toWei(price, "ether"))
        .send({
          from: account,
          gasPrice: "20000000000"
        });

      alert("Event Created ✅");
    } catch (err) {
      console.error(err);
      alert("Error creating event ❌");
    }
  };

  // 🎟️ BOOK
  const bookTicket = async () => {
    try {
      const priceWei = await contract.methods
        .getEventPrice(bookEventId)
        .call();

      await contract.methods
        .createTicketLocked(
          ticketId,
          "TICKET-" + ticketId,
          bookEventId,
          "VIP"
        )
        .send({
          from: account,
          value: priceWei,
          gasPrice: "20000000000"
        });

      const data = await contract.methods
        .getTicketLocked(ticketId)
        .call();

      setTicketData(data);

      alert("Ticket Booked 🎟️");
    } catch (err) {
      console.error(err);
      alert("Booking Failed ❌");
    }
  };

  // ✅ VERIFY (FIXED)
  const verifyTicket = async () => {
    try {
      const data = await contract.methods
        .getTicketLocked(verifyId)
        .call();

      if (data.isScanned) {
        alert("⚠️ Ticket already scanned");
        return;
      }

      await contract.methods
        .scanTicketLocked(verifyId)
        .send({
          from: account,
          gasPrice: "20000000000"
        });

      const updated = await contract.methods
        .getTicketLocked(verifyId)
        .call();

      setTicketData(updated);

      alert("Verified ✅");
    } catch (err) {
      console.error(err);
      alert("Verification Failed ❌");
    }
  };

  // 🪑 SEATS
  const checkSeats = async () => {
    const data = await contract.methods
      .getAvailableSeats(eventId)
      .call();

    setSeatsLeft(data);
  };

  return (
    <div style={{
      background: "#f4f6f9",
      minHeight: "100vh",
      padding: "30px",
      fontFamily: "Arial"
    }}>
      <h1 style={{ textAlign: "center", color: "#2c3e50" }}>
        🎟️ Event Ticket System
      </h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button style={button} onClick={connectWallet}>
          Connect Wallet
        </button>
        <p>Account: {account}</p>
        <p><b>Role:</b> {role}</p>
      </div>

      {/* ADMIN */}
      {role.includes("ADMIN") && (
        <div style={card}>
          <h3>Create Event</h3>
          <input style={input} placeholder="Event ID" onChange={(e) => setEventId(e.target.value)} />
          <input style={input} placeholder="Seats" onChange={(e) => setSeats(e.target.value)} />
          <input style={input} placeholder="Price (ETH)" onChange={(e) => setPrice(e.target.value)} />
          <br />
          <button style={button} onClick={createEvent}>Create Event</button>
        </div>
      )}

      {/* BOOK */}
      {(role.includes("USER") || role.includes("ADMIN")) && (
        <div style={card}>
          <h3>Book Ticket</h3>
          <input style={input} placeholder="Ticket ID" onChange={(e) => setTicketId(e.target.value)} />
          <input style={input} placeholder="Event ID" onChange={(e) => setBookEventId(e.target.value)} />
          <br />
          <button style={button} onClick={bookTicket}>Book Ticket</button>

          {ticketData && (
            <div style={{
              marginTop: "10px",
              background: "#ecf0f1",
              padding: "10px",
              borderRadius: "5px"
            }}>
              <p><b>Ticket ID:</b> {ticketData.ticketId}</p>
              <p><b>Event:</b> {ticketData.eventId}</p>
              <p><b>Owner:</b> {ticketData.owner}</p>
              <p><b>Status:</b> {ticketData.isScanned ? "Used ❌" : "Valid ✅"}</p>
            </div>
          )}
        </div>
      )}

      {/* VERIFY */}
      {(role.includes("VERIFIER") || role.includes("ADMIN")) && (
        <div style={card}>
          <h3>Verify Ticket</h3>
          <input style={input} placeholder="Ticket ID" onChange={(e) => setVerifyId(e.target.value)} />
          <br />
          <button style={button} onClick={verifyTicket}>Verify</button>
        </div>
      )}

      {/* SEATS */}
      <div style={card}>
        <h3>Seats Info</h3>
        <input style={input} placeholder="Event ID" onChange={(e) => setEventId(e.target.value)} />
        <br />
        <button style={button} onClick={checkSeats}>Check Seats</button>
        <p><b>Seats Left:</b> {seatsLeft}</p>
      </div>
    </div>
  );
}

export default App;