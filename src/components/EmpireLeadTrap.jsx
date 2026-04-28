import React, { useEffect, useState, useMemo } from 'react';
import * as solanaWeb3 from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import MapboxGL from '@mapbox/react-mapbox-gl';
import { Layer, Feature } from '@mapbox/react-mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Pyth Network setup
import { PythConnection, get};
import { clusterApiUrl, Connection, Keypair } from '@solana/web3.js';

// Audio for "WHALE" detection
import useSound from 'use-sound';
import whaleSound from './whale.mp3'; // Ensure you have a whale.mp3 in the same directory

// Mapbox GL JS access token
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN'; // Replace with your Mapbox token
const EMPIRE_VAULT_ADDRESS = new solanaWeb3.PublicKey(process.env.EMPIRE_VAULT_ADDRESS || 'YOUR_EMPIRE_VAULT_ADDRESS'); // Replace with your Empire AI vault address
const USDC_MINT = new solanaWeb3.PublicKey(process.env.USDC_MINT || 'Gh9Zg8P2xT2F8YhT49h27fFj2x8z8z8z8z8z8z8z8z'); // Example USDC Mint Address

// Pyth Network Constants
const PYTH_USDC_FEED = 'YOUR_PYTH_USDC_FEED_ID'; // Replace with actual Pyth USDC feed ID

const EmpireLeadTrap = () => {
  const [viewport, setViewport] = useState({
    containerStyle: {
      height: '100%',
      width: '100%'
    },
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-0.118092, 51.509865], // Default to London
    zoom: [10],
  });
  const [whaleAlert, setWhaleAlert] = useState(false);
  const [whaleHistory, setWhaleHistory] = useState([]);
  const [playWhaleSound] = useSound(whaleSound);

  // Solana Wallet Adapter
  const wallet = useWallet();
  const connection = useMemo(() => new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta')), []);

  // Pyth Connection
  const pythConnection = useMemo(() => new PythConnection(connection, solanaWeb3.clusterApiUrl('mainnet-beta')), [connection]);

  useEffect(() => {
    // Listen for Pyth price updates (simplified example)
    pythConnection.onPriceChange((product, price) => {
      if (product.id === PYTH_USDC_FEED && price.price > 10000) { // Example: detect large price movements as "whale" activity
        setWhaleAlert(true);
        playWhaleSound();
        setWhaleHistory(prev => [...prev, { timestamp: new Date(), price: price.price }]);
        setTimeout(() => setWhaleAlert(false), 5000); // Clear alert after 5 seconds
      }
    });

    // Clean up Pyth connection on unmount
    return () => {
      pythConnection.stop();
    };
  }, [pythConnection, playWhaleSound]);

  const handleTransfer = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert('Please connect your wallet.');
      return;
    }

    try {
      const transaction = new solanaWeb3.Transaction();
      const fromTokenAccount = await splToken.getAssociatedTokenAddress(
        USDC_MINT,
        wallet.publicKey
      );
      const toTokenAccount = await splToken.getAssociatedTokenAddress(
        USDC_MINT,
        EMPIRE_VAULT_ADDRESS
      );

      // Create token account if it doesn't exist for the vault
      if (!(await connection.getAccountInfo(toTokenAccount))) {
        transaction.add(
          splToken.createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            toTokenAccount,
            EMPIRE_VAULT_ADDRESS,
            USDC_MINT
          )
        );
      }

      transaction.add(
        splToken.createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          wallet.publicKey,
          1000000, // 1 USDC (assuming 6 decimal places for USDC)
          []
        )
      );

      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signed = await wallet.sendTransaction(transaction, connection);
      console.log('Transfer successful:', signed);
      alert('Transfer successful!');
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('Transfer failed. Check console for details.');
    }
  };

  return (
    <div className="empire-lead-trap" style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '10px', background: '#282c34', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Empire AI Predictive Revenue Engine HUD</h1>
        <WalletMultiButton />
      </header>

      {whaleAlert && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'red', color: 'white', padding: '20px', borderRadius: '10px', zIndex: 1000 }}>
          WHALE DETECTED! Large transaction activity!
        </div>
      )}

      <div style={{ flexGrow: 1 }}>
        <MapboxGL
          style={viewport.style}
          containerStyle={viewport.containerStyle}
          center={viewport.center}
          zoom={viewport.zoom}
          accessToken={MAPBOX_TOKEN}
          onViewportChange={newViewport => setViewport(prev => ({ ...prev, ...newViewport }))}
        >
          {/* Example: Display whale history on map */}
          {whaleHistory.map((event, index) => (
            <Feature key={index} coordinates={viewport.center} properties={{ price: event.price, timestamp: event.timestamp.toLocaleString() }} />
          ))}
          <Layer
            type="symbol"
            id="whale-event"
            layout={{ 'icon-image': 'rocket-15', 'text-field': '{price}', 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-offset': [0, 0.6], 'text-anchor': 'top' }}
          >
            {whaleHistory.map((event, index) => (
              <Feature key={index} coordinates={viewport.center} properties={{ price: event.price, timestamp: event.timestamp.toLocaleString() }} />
            ))}
          </Layer>
        </MapboxGL>
      </div>

      <footer style={{ padding: '10px', background: '#282c34', color: 'white', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <button onClick={handleTransfer} disabled={!wallet.connected}>
          Transfer 1 USDC to Empire Vault
        </button>
        <div>
          <span>Wallet Status: {wallet.connected ? 'Connected' : 'Disconnected'}</span>
          {wallet.publicKey && <span> | Public Key: {wallet.publicKey.toBase58()}</span>}
        </div>
      </footer>
    </div>
  );
};

const EmpireLeadTrapWithWallet = () => {
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={solanaWeb3.clusterApiUrl('mainnet-beta')}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <EmpireLeadTrap />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default EmpireLeadTrapWithWallet;
