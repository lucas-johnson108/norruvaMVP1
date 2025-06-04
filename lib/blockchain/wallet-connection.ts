
// src/lib/blockchain/wallet-connection.ts
/**
 * @fileOverview Utilities for connecting to user's Web3 wallet (e.g., MetaMask)
 * and managing provider/signer instances on the frontend.
 */

import { ethers, type BrowserProvider, type Signer } from 'ethers';

interface WalletConnectionState {
  provider: BrowserProvider | null;
  signer: Signer | null;
  account: string | null;
  chainId: bigint | null; // Changed from number to bigint
  isConnected: boolean;
  error: string | null;
}

const initialWalletState: WalletConnectionState = {
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  isConnected: false,
  error: null,
};

// This could be a class or a set of functions.
// For a hook-based approach (like useBlockchain), this logic might be integrated there.
// This file provides standalone utilities if needed outside of React hooks.

export async function connectWallet(): Promise<WalletConnectionState> {
  if (typeof window.ethereum === 'undefined') {
    return { ...initialWalletState, error: "MetaMask (or other Web3 wallet) not detected. Please install it." };
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Request account access
    await provider.send("eth_requestAccounts", []);
    
    const signer = await provider.getSigner();
    const account = await signer.getAddress();
    const network = await provider.getNetwork();
    const chainId = network.chainId;

    // Listen for account changes
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      console.log('Wallet accounts changed:', accounts);
      // Handle account change, e.g., by reloading or updating state.
      // For simplicity, we might just inform the user to reconnect or reload.
      window.location.reload(); // Simple way to handle, but can be improved.
    });

    // Listen for chain changes
    window.ethereum.on('chainChanged', (newChainId: string) => {
      console.log('Wallet chain changed to:', newChainId);
      window.location.reload(); // Simple way to handle network change
    });

    return {
      provider,
      signer,
      account,
      chainId,
      isConnected: true,
      error: null,
    };
  } catch (error: any) {
    console.error("Error connecting wallet:", error);
    let errorMessage = "Failed to connect wallet.";
    if (error.code === 4001) { // User rejected the request
        errorMessage = "Wallet connection request rejected by user.";
    } else if (error.message) {
        errorMessage = error.message;
    }
    return { ...initialWalletState, error: errorMessage };
  }
}

export async function disconnectWallet(currentState: WalletConnectionState): Promise<WalletConnectionState> {
  // For MetaMask, "disconnecting" usually means the app forgets the connection.
  // The user manages actual disconnection from the MetaMask extension itself.
  // We can clear our application's state.
  if (window.ethereum && window.ethereum.removeAllListeners) {
    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
  }
  console.log("Wallet connection state cleared by application.");
  return initialWalletState;
}

export async function getWalletState(): Promise<WalletConnectionState> {
  if (typeof window.ethereum === 'undefined') {
    return initialWalletState; // No wallet installed
  }
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.listAccounts();
    if (accounts.length === 0 || !accounts[0]) {
      return initialWalletState; // Not connected or no accounts authorized
    }
    const signer = await provider.getSigner();
    const account = signer.address; // accounts[0] may not be the currently selected one if signer is used.
    const network = await provider.getNetwork();
    const chainId = network.chainId;

    return {
      provider,
      signer,
      account,
      chainId,
      isConnected: true,
      error: null,
    };

  } catch (error) {
    console.error("Error getting existing wallet state:", error);
    return { ...initialWalletState, error: "Could not retrieve wallet state." };
  }
}
