import React, { useState } from "react";
// import diceImage from "./assets/pixel-dixed.png";

// First, define the CryptoSwapCard component
const CryptoSwapCard = () => {
  const [value, setValue] = useState(0.1);
  const [searchInput, setSearchInput] = useState("");
  const [searchPlaceholder] = useState(
    "Search a ticker (e.g. $DOX) or token address"
  );

  const handleIncrement = () => {
    setValue((prev) => Math.round((prev + 0.01) * 100) / 100);
  };

  const handleDecrement = () => {
    setValue((prev) => Math.max(0, Math.round((prev - 0.01) * 100) / 100));
  };

  return (
    <>
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button className="search-button">Search</button>
        </div>
        {searchInput && (
          <a
            href={`https://basescan.org/address/${searchInput}`}
            target="_blank"
            rel="noopener noreferrer"
            className="basescan-link"
          >
            View in basescan
          </a>
        )}
      </div>

      <div className="card">
        <div className="input-container">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Math.max(0, parseFloat(e.target.value)))}
            step="0.01"
            min="0"
            className="number-input"
          />
          <div className="chevron-controls">
            <button onClick={handleIncrement} className="chevron up">
              ▲
            </button>
            <button onClick={handleDecrement} className="chevron down">
              ▼
            </button>
          </div>
        </div>

        <div className="exchange-info">
          <div className="send-section">
            <span className="label">You send</span>
            <span className="amount">
              {value.toFixed(2)} <span className="eth-currency">ETH</span>
            </span>
          </div>

          {/* <div className="arrow-container">
            <div className="arrow-circle">↓</div>
          </div> */}

          <div className="dice-container">
            <img
              width={48}
              height={"auto"}
              src={"/assets/dice.png"}
              alt="A dice."
            />
          </div>

          <div className="receive-section">
            <span className="label">You receive</span>
            <span className="amount">
              ~ {(value * 10000).toLocaleString()}{" "}
              <span className="dox-currency">$DOX</span>
            </span>
          </div>

          <div className="exchange-rate">
            {value.toFixed(2)} <span className="eth-currency">ETH</span> ={" "}
            {(value * 10000).toLocaleString()}{" "}
            <span className="dox-currency">$DOX</span>
          </div>
        </div>

        <div className="button-container">
          <AnimatedButtonCSS text="Buy" />
        </div>
      </div>
    </>
  );
};

// Next, define the  component
const LaunchCard = () => {
  const [symbol, setSymbol] = useState("DOX");
  const [name, setName] = useState("Doxa Cash");

  const handleSymbolChange = (e) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 5);
    setSymbol(value);
  };

  return (
    <div className="card">
      <div className="launch-field-container">
        <div className="launch-field-label">$</div>
        <input
          type="text"
          className="launch-field-input large"
          value={symbol}
          onChange={handleSymbolChange}
        />
      </div>

      <div className="launch-field-container">
        <div className="launch-field-label">Name</div>
        <input
          type="text"
          className="launch-field-input normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="launch-info">
        <p>
          You are deploying a <span className="emphasis">permissionless</span>{" "}
          ERC-20 smart contract on{" "}
          <a href="#" className="link">
            Base
          </a>
          . This contract sells 10,000 tokens in exchange for 1 ETH, and 0.3%
          less tokens for every next 1 ETH.
          <br />
          <br />
          Learn more about{" "}
          <a href="#" className="link">
            how it works
          </a>
          .
        </p>

        <p className="cost">
          Cost: ~ <span className="purple-text">$0.002</span>
        </p>
      </div>

      <AnimatedButtonCSS text="Launch" />
    </div>
  );
};

// Define the AnimatedButtonCSS component
const AnimatedButtonCSS = ({ text = "Buy", symbol = "DOX", children }) => {
  const firstLetter = text[0].toUpperCase();
  const restText = text.slice(1);

  return (
    <div className="button-container">
      <button className="animated-button">
        <span className="first-letter" style={{ color: "#FFFF00" }}>
          {firstLetter}
        </span>
        {restText} &nbsp;
        <span>${symbol}</span>
        {children}
      </button>
    </div>
  );
};

// Main page component
const CryptoExchangePage = () => {
  const [activeTab, setActiveTab] = useState("buy");

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === "buy" ? "selected" : ""}`}
            onClick={() => setActiveTab("buy")}
          >
            <span className={activeTab === "buy" ? "first-letter" : ""}>B</span>
            uy
          </button>
          <button
            className={`tab-button ${activeTab === "launch" ? "selected" : ""}`}
            onClick={() => setActiveTab("launch")}
          >
            <span className={activeTab === "launch" ? "first-letter" : ""}>
              L
            </span>
            aunch
          </button>
        </div>

        {activeTab === "buy" ? <CryptoSwapCard /> : <LaunchCard />}
      </div>
    </div>
  );
};

const styles = `
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden; /* Prevents scrolling */
}

.page-container {
  background-color: #A5A4CE;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: fit-content;  /* Change from 100% to fit-content */
  max-width: 480px;
  margin: 0 auto;
}

.tab-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tab-button {
  flex: 1;
  padding: 0.75rem 2rem;
  font-size: 1.25rem;
  font-weight: bold;
  border: 1px solid black;
  cursor: pointer;
  background-color: #C0C0C0;
  color: white;
  transition: background-color 0.3s ease;
}

.tab-button.selected {
  background-color: #008001;
}

.tab-button .first-letter {
  color: #FFFF00;
}

.search-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-container {
  display: flex;
  width: 100%;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid black;
  background-color: white;
}

.search-input::placeholder {
  color: #C0C0C0;
}

.search-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid black;
  background-color: #C0C0C0;
  cursor: pointer;
  white-space: nowrap;
}

.search-button:hover {
  background-color: #A9A9A9;
}

.basescan-link {
  color: #FFFF00;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.875rem;
  width: fit-content;
}

.basescan-link:hover {
  opacity: 0.8;
}

/* Card Styles */
.card {
  background-color: #C0C0C0;
  border: 4px solid white;
  padding: 2rem;
  width: 480px;
  box-shadow: 20px 20px 16px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 1rem;  /* Reduce the gap from 2rem to 1rem */
}

.input-container {
  display: flex;
  position: relative;
  height: 48px;
}

.number-input {
  flex-grow: 1;
  background-color: #0000FF;
  color: #03FFFF;
  font-size: 2rem;
  padding: 0.5rem 1rem;
  border: none;
  box-shadow: inset 4px 4px 16px rgba(0, 0, 0, 0.48);
}

.number-input::-webkit-inner-spin-button,
.number-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.chevron-controls {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background-color: #D3D3D3;
}

.chevron {
  border: 1px solid black;
  background: none;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  color: #000;
  font-size: 0.75rem;
  height: 50%;
}

.chevron:hover {
  background-color: #A9A9A9;
}

.exchange-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.send-section,
.receive-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 1.25rem;
  color: #000;
}

.amount {
  font-size: 1.25rem;
  color: #000;
}

.eth-currency {
  color: #008001;
}

.dox-currency {
  color: #800080;
}

.dice-container {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
  animation: rotate 4s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.exchange-rate {
  text-align: left;
  color: #666;
  font-size: 0.875rem;
}

.button-container {
  position: relative;
  width: 200px;
  height: 40px;
  margin: 0 auto;
  margin-bottom: 1rem;
}

.animated-button {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0.5rem 1.5rem;
  background-color: #008001;
  color: white;
  font-size: 1.25rem;
  font-weight: bold;
  border: 1px solid black;
  box-shadow: 16px 16px 4px rgba(0, 0, 0, 0.32);
  transition: all 0.3s ease;
  width: 200px;
  cursor: pointer;
}

.animated-button .first-letter {
  color: #FFFF00;
}

.animated-button:hover {
  background-color: #7CE860;
  box-shadow: none;
  transform: translate(16px, 16px);
}

/* Launch Card specific styles */
.launch-field-container {
  display: flex;
  width: 100%;
  position: relative;
  margin-bottom: 1rem;  /* Add specific margin instead of relying on gap */
}

.launch-field-label {
  background-color: #C0C0C0;
  color: black;
  padding: 0.75rem 1rem;
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid black;
  font-weight: bold;
  z-index: 1;
}

.launch-field-input {
  flex: 1;
  background-color: #0000FF;
  color: #03FFFF;
  border: none;
  padding: 0.75rem 1rem;
  box-shadow: inset 4px 4px 16px rgba(0, 0, 0, 0.48);
  outline: none;
}

.launch-field-input.large {
  font-size: 2rem;
  height: 64px;
}

.launch-field-input.normal {
  font-size: 1.5rem;
  height: 48px;
}

.launch-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: black;
  font-size: 1rem;
  line-height: 1.5;
}

.emphasis {
  font-style: italic;
}

.link {
  color: blue;
  text-decoration: underline;
}

.purple-text {
  color: #800080;
}

.cost {
  font-weight: bold;
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default CryptoExchangePage;
