import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { client } from "./client";
import {
  ConnectButton,
  darkTheme,
  useActiveWallet,
  useActiveWalletConnectionStatus,
} from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import {
  isAddress,
  getContract,
  readContract,
  toUnits,
  toEther,
  prepareContractCall,
  sendTransaction,
  keccak256,
  stringToHex,
} from "thirdweb";
import { upload } from "thirdweb/storage";
import { base } from "thirdweb/chains";

const DOX_ADDRESS = "0xAb23b2B48BB6588dC30a5d3185CC747406e55288";
const DOXA_FACTORY_ADDRESS = "0x1d5756eF591743E02c2FdDa287e34B9846017CFc";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const factoryContract = getContract({
  client,
  address: DOXA_FACTORY_ADDRESS,
  chain: base,
});
const doxaTokenContract = getContract({
  client,
  address: DOX_ADDRESS,
  chain: base,
});

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
];

const ConnectWallet = () => {
  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      theme={darkTheme({
        colors: {
          modalBg: "#1f1f6b",
          accentText: "#03ffff",
          borderColor: "#ffffff",
        },
      })}
      connectButton={{ label: "Connect Wallet" }}
      connectModal={{ size: "wide" }}
    />
  );
};

// First, define the CryptoSwapCard component
const CryptoSwapCard = () => {
  const wallet = useActiveWallet();
  const connectionStatus = useActiveWalletConnectionStatus();

  const [ethValue, setEthValue] = useState(0.1);
  const [searchInput, setSearchInput] = useState(DOX_ADDRESS);
  const [tokenAddress, setTokenAddress] = useState(DOX_ADDRESS);

  const [diceLoading, setDiceLoading] = useState(false);
  const [tickerValue, setTickerValue] = useState("DOX");
  const [amountPerETH, setAmountPerETH] = useState(10000);

  useEffect(() => {
    const getAndSetAmountPerEther = async () => {
      const data = await readContract({
        contract: doxaTokenContract,
        method:
          "function getAmountOut(uint256) public view returns (uint256, uint256,uint256)",
        params: [toUnits("1", 18)],
      });
      setAmountPerETH(Math.floor(parseFloat(toEther(data[0]))));
    };

    getAndSetAmountPerEther();
  }, []);

  const handleSearch = async (address) => {
    setDiceLoading(true);

    if (!isAddress(address)) {
      alert("Error: invalid address! Please check your search input.");

      setSearchInput("");
      setTokenAddress(ZERO_ADDRESS);
      setTickerValue("TOKEN");
      setAmountPerETH(0);

      setDiceLoading(false);
      return;
    }

    let registered = false;
    try {
      registered = await readContract({
        contract: factoryContract,
        method: "function registered(address) view returns (bool)",
        params: [address],
      });
    } catch (e) {
      alert(`Error: ${e.message}`);
      setSearchInput("");
      setTokenAddress(ZERO_ADDRESS);
      setTickerValue("TOKEN");
      setAmountPerETH(0);

      setDiceLoading(false);
      return;
    }

    if (!registered) {
      alert(
        "Error: address not a Doxa contract! Please check your search input."
      );

      setSearchInput("");
      setTokenAddress(ZERO_ADDRESS);
      setTickerValue("TOKEN");
      setAmountPerETH(0);

      setDiceLoading(false);
      return;
    }

    const token = getContract({
      client,
      address,
      chain: base,
    });

    try {
      const ticker = await readContract({
        contract: token,
        method: "function symbol() view returns (string)",
      });
      setTickerValue(ticker);

      const amountOut = (
        await readContract({
          contract: token,
          method:
            "function getAmountOut(uint256) view returns (uint256,uint256,uint256)",
          params: [toUnits("1", 18)],
        })
      )[0];

      setAmountPerETH(Math.floor(parseFloat(toEther(amountOut))));
    } catch (e) {
      alert(`Error: ${e.message}`);
      setDiceLoading(false);
      return;
    }

    setTokenAddress(address);
    setDiceLoading(false);

    return;
  };

  const handleIncrement = () => {
    setEthValue((prev) => Math.round((prev + 0.01) * 100) / 100);
  };

  const handleDecrement = () => {
    setEthValue((prev) =>
      Math.max(0.0001, Math.round((prev - 0.01) * 100) / 100)
    );
  };

  const handleBuy = async () => {
    setDiceLoading(true);

    if (connectionStatus === "disconnected") {
      alert("Error: Please connect your wallet.");
      setDiceLoading(false);
      return;
    }

    if (!isAddress(tokenAddress) || tokenAddress === ZERO_ADDRESS) {
      alert("Error: Please search for a valid token to buy.");
      setDiceLoading(false);
      return;
    }

    if (ethValue <= 0) {
      alert("Error: Please enter a valid amount of eth to send.");
      setDiceLoading(false);
      return;
    }

    if (wallet.getChain().id !== base.id) {
      try {
        await wallet.switchChain(base);
      } catch (e) {
        alert(`Error: ${e.message}`);
        setDiceLoading(false);
        return;
      }
    }

    try {
      const token = getContract({
        client,
        address: tokenAddress,
        chain: base,
      });

      const transaction = prepareContractCall({
        contract: token,
        method: "function buy()",
        value: toUnits(ethValue.toString(), 18),
        chain: base,
      });

      const { transactionHash } = await sendTransaction({
        transaction,
        account: wallet.getAccount(),
        chain: base,
      });

      alert(`Transaction sent: https://basescan.org/tx/${transactionHash}`);
    } catch (e) {
      alert(`Error: ${e.message}`);
    }

    setDiceLoading(false);
  };

  return (
    <>
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder={"Search a token address e.g 0x3dc2b1c20e..."}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={diceLoading}
          />
          <button
            className="search-button"
            onClick={(e) => handleSearch(searchInput)}
          >
            Search
          </button>
        </div>
        {tokenAddress !== ZERO_ADDRESS && (
          <a
            href={`https://basescan.org/address/${tokenAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="basescan-link"
          >
            {`View in basescan: ${tokenAddress}`}
          </a>
        )}
      </div>

      <div className="card">
        <div className="input-container">
          <input
            type="number"
            value={ethValue}
            onChange={(e) => {
              setEthValue(Math.max(0.0001, parseFloat(e.target.value)));
            }}
            step="0.0001"
            min="0.0001"
            className="number-input"
            disabled={diceLoading}
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
              {ethValue.toFixed(4)} <span className="eth-currency">ETH</span>
            </span>
          </div>

          {diceLoading ? (
            <div className="dice-container-loading">
              <img
                width={48}
                height={"auto"}
                src={"/assets/dice.png"}
                alt="A dice."
              />
            </div>
          ) : (
            <div className="dice-container">
              <img
                width={48}
                height={"auto"}
                src={"/assets/dice.png"}
                alt="A dice."
              />
            </div>
          )}

          <div className="receive-section">
            <span className="label">You receive</span>
            <span className="amount">
              ~ {(ethValue * amountPerETH).toLocaleString()}{" "}
              <span className="dox-currency">{`$${tickerValue}`}</span>
            </span>
          </div>

          <div className="exchange-rate">
            {1} <span className="eth-currency">ETH</span> = ~{" "}
            {amountPerETH.toLocaleString()}{" "}
            <span className="dox-currency">{`$${tickerValue}`}</span>
          </div>
        </div>

        <div className="button-container">
          <AnimatedButtonCSS
            text="Buy"
            symbol={tickerValue}
            toDisable={diceLoading}
            handler={handleBuy}
          />
        </div>
      </div>
    </>
  );
};

function LaunchCard() {
  const wallet = useActiveWallet();
  const connectionStatus = useActiveWalletConnectionStatus();

  // State variables for each field
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageURI, setImageURI] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [diceLoading, setDiceLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [tokenAddr, setTokenAddr] = useState("");

  // Function to handle Ticker input
  const handleTickerChange = (e) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 5);
    setTicker(value);
  };

  const handleLaunch = async () => {
    setDiceLoading(true);

    if (!ticker || !name) {
      alert("Error: ticker and name are required!");
      setDiceLoading(false);
      return;
    }

    if (connectionStatus === "disconnected") {
      alert("Error: Please connect your wallet.");
      setDiceLoading(false);
      return;
    }

    if (wallet.getChain().id !== base.id) {
      try {
        await wallet.switchChain(base);
      } catch (e) {
        alert(`Error: ${e.message}`);
        setDiceLoading(false);
        return;
      }
    }

    const salt = keccak256(stringToHex(uuidv4() + wallet.address));
    let tokenAddress = "";
    try {
      tokenAddress = await readContract({
        contract: factoryContract,
        method:
          "function predictTokenAddress(bytes32) public view returns (address)",
        params: [salt],
      });
    } catch (e) {
      alert(`Error: ${e.message}`);
      setDiceLoading(false);
      return;
    }
    setTokenAddr(tokenAddress);

    let metadataURI = "";
    try {
      metadataURI = await upload({
        client,
        files: [
          {
            name: name,
            description: description,
            image: imageURI,
          },
        ],
      });
    } catch (e) {
      alert(`Error: ${e.message}`);
      setDiceLoading(false);
      return;
    }

    let transactionHash = "";
    try {
      const transaction = prepareContractCall({
        contract: factoryContract,
        method:
          "function createToken(string,string,string, bytes32) returns (address)",
        params: [name, ticker, metadataURI, salt],
        chain: base,
      });

      const { transactionHash: hash } = await sendTransaction({
        transaction,
        account: wallet.getAccount(),
        chain: base,
      });
      transactionHash = hash;
    } catch (e) {
      alert(`Error: ${e.message}`);
      setDiceLoading(false);
      return;
    }
    setTxHash(transactionHash);

    setDiceLoading(false);
  };

  // Function to handle image upload and resizing
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validFileTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validFileTypes.includes(file.type)) {
      alert("Error: Only JPG, PNG, or GIF files are allowed.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      // 2 MB limit
      alert("Error: file size larger than the max. 2 MB");
      return;
    }

    try {
      const uri = await upload({
        client,
        files: [file],
      });
      setImageURI(uri);
    } catch (e) {
      alert(`Error: ${e.message}`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        // Create a canvas to resize the image
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxWidth = 200;

        // Calculate the new width and height
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const resizedImage = canvas.toDataURL(file.type); // Convert to base64 for preview
        setImagePreview(resizedImage);
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="card">
      <div className="launch-input-flex">
        {/* Ticker Input */}
        <div className="launch-input-group">
          <label>$Ticker</label>
          <input
            type="text"
            disabled={diceLoading}
            value={ticker}
            onChange={handleTickerChange}
            placeholder="Ticker"
          />
        </div>

        {/* Name Input */}
        <div className="launch-input-group">
          <label>Name</label>
          <input
            type="text"
            disabled={diceLoading}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
        </div>
      </div>

      {/* Description Input */}
      <div className="launch-input-group">
        <label>Description</label>
        <textarea
          value={description}
          disabled={diceLoading}
          onChange={(e) => setDescription(e.target.value.slice(0, 280))}
          placeholder="Description"
        />
        <small>{description.length}/280</small>
      </div>

      {/* Image Upload */}
      <div className="launch-input-group">
        <label>Upload image (JPG, PNG, GIF only):</label>
        <input
          type="file"
          onChange={handleImageUpload}
          disabled={diceLoading}
        />
        {imagePreview && (
          <div>
            <img src={imagePreview} alt="Preview" className="image-preview" />
          </div>
        )}
      </div>

      {diceLoading ? (
        <div className="dice-container-loading">
          <img
            width={48}
            height={"auto"}
            src={"/assets/dice.png"}
            alt="A dice."
          />
        </div>
      ) : txHash ? (
        <p className="eth-currency">
          Success! Deployed token:{" "}
          <span>
            <a
              href={`https://basescan.org/address/${tokenAddr}`}
              target="blank"
              rel="noreferrer"
            >
              {tokenAddr}
            </a>
          </span>{" "}
          at transaction{" "}
          <span>
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="blank"
              rel="noreferrer"
            >
              {txHash}
            </a>
          </span>
        </p>
      ) : (
        <div className="launch-info">
          <p>
            You are deploying a <span className="emphasis">permissionless</span>{" "}
            ERC-20 smart contract on{" "}
            <a
              href="https://www.base.org/"
              className="link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Base
            </a>
            . This contract sells 10,000 tokens in exchange for 1 ETH, and 0.3%
            less tokens for every next 1 ETH.
            <br />
            <br />
            Learn more about{" "}
            <a
              href="https://hackmd.io/@monkeymeaning/doxa"
              className="link"
              target="_blank"
              rel="noopener noreferrer"
            >
              how it works
            </a>
            .
          </p>
        </div>
      )}

      <AnimatedButtonCSS
        text="Launch"
        symbol={!ticker ? "TOKEN" : ticker}
        handler={handleLaunch}
        toDisable={diceLoading}
      />
    </div>
  );
}

// Define the AnimatedButtonCSS component
const AnimatedButtonCSS = ({
  text = "Buy",
  symbol = "DOX",
  toDisable = false,
  handler,
  children,
}) => {
  const firstLetter = text[0].toUpperCase();
  const restText = text.slice(1);

  return (
    <div className="button-container">
      <button
        className="animated-button"
        onClick={handler}
        disabled={toDisable}
      >
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
      <div className="top-right-button">
        <ConnectWallet chain={base} />
      </div>
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
  gap: 1rem;
  width: fit-content;  /* Change from 100% to fit-content */
  max-width: 480px;
  margin: 0 auto;
}

.tab-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.tab-button {
  flex: 1;
  padding: 0.5rem 0.5rem;
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

.dice-container-loading {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
  animation: rotate 0.4s linear infinite;
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
  width: 240px;
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
  width: 240px;
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

.top-right-button {
  position: absolute; /* Remove the button from the normal flow */
  top: 1rem; /* Adjust as needed for spacing from the top */
  right: 1rem; /* Adjust as needed for spacing from the right */
  z-index: 10; /* Ensures the button is above other elements */
}

.top-right-button button {
  padding: 0.5rem 1rem; /* Add some padding to the button */
  background-color: #800080; /* Example button color */
  color: white; /* Text color */
  font-size: 1.25rem;
  font-weight: bold;
  border: 1px solid black;
  border-radius: 4px; /* Rounded corners */
  cursor: pointer;
}

  .launch-input-flex {
    display: flex;
    gap: 2rem;
  }

  .launch-input-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: black; /* Black label font color */
  }

  .card input[type="text"],
  .card textarea {
    width: 100%;
    padding: 0.5rem; /* Appropriate padding */
    background-color: #0000FF; /* Blue background color */
    color: #03FFFF; /* Cyan font color */
    box-shadow: inset 4px 4px 16px rgba(0, 0, 0, 0.48); /* Box shadow */
    border: none;
    border-radius: 4px; /* Slight rounding */
    font-size: 1rem; /* Adjust font size */
  }

  .card textarea {
    min-height: 50px;
    resize: none;
  }

  .image-preview {
    margin-top: 1rem;
    max-height: 100px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default CryptoExchangePage;
