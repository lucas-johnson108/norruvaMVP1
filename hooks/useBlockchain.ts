
// src/hooks/useBlockchain.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
// Assuming User type is available from dashboard context or similar
// import type { MockUser } from '@/app/dashboard/page'; // If using dashboard user context
import { functions } from '@/lib/firebase'; // Main Firebase instance
import { httpsCallable } from 'firebase/functions';
import { toast } from "@/hooks/use-toast";

interface BlockchainState {
  account: string | null;
  nativeBalance: string; // Native currency balance (e.g., ETH, MATIC)
  noruTokenBalance: string; // NORU token balance
  stakedNoruBalance: string; // Staked NORU token balance
  isConnected: boolean;
  providerLoading: boolean; // For initial provider connection & balance loading
  actionLoading: boolean; // For specific actions like stake/mint
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
}

// Mock values - replace with actual contract addresses and ABIs
const NORU_TOKEN_ADDRESS_MOCK = "0xMockNoruTokenAddress";
const NORU_TOKEN_ABI_MOCK = [ /* ERC20 ABI subset: balanceOf, approve, transferFrom */ 
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
]; 
const STAKING_CONTRACT_ADDRESS_MOCK = "0xMockStakingContractAddress";
const STAKING_CONTRACT_ABI_MOCK = [ /* Staking ABI subset: stake, unstake, userStakedBalance */ 
    "function stake(uint256 amount)",
    "function userStakedBalance(address user) view returns (uint256)",
];


export function useBlockchain() {
  const [state, setState] = useState<BlockchainState>({
    account: null,
    nativeBalance: '0',
    noruTokenBalance: '0',
    stakedNoruBalance: '0',
    isConnected: false,
    providerLoading: true,
    actionLoading: false,
    provider: null,
    signer: null,
  });

  // Mock user data - in a real app, this would come from an Auth context
  const mockUser = { organizationId: 'mockOrg123' }; // Replace with actual user context if available

  const initializeProvider = useCallback(async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        setState(prev => ({ ...prev, providerLoading: true }));
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await browserProvider.listAccounts();
        
        if (accounts.length > 0 && accounts[0]) {
          const currentSigner = await browserProvider.getSigner();
          const currentAccount = currentSigner.address;
          setState(prev => ({
            ...prev,
            account: currentAccount,
            provider: browserProvider,
            signer: currentSigner,
            isConnected: true,
          }));
        } else {
          setState(prev => ({ ...prev, isConnected: false, providerLoading: false }));
        }
      } catch (error) {
        console.error('Error initializing provider:', error);
        toast({ variant: "destructive", title: "Wallet Error", description: "Could not initialize Web3 provider."});
        setState(prev => ({ ...prev, providerLoading: false, isConnected: false }));
      }
    } else {
      console.warn("MetaMask or other Ethereum provider not detected.");
      setState(prev => ({ ...prev, providerLoading: false, isConnected: false }));
    }
  }, []);

  useEffect(() => {
    initializeProvider();

    // Listen for account changes
    if (window.ethereum && window.ethereum.on) {
        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                // MetaMask is locked or the user has disconnected all accounts
                disconnectWallet();
            } else if (accounts[0] !== state.account) {
                initializeProvider(); // Re-initialize to get new signer and load data
            }
        };
        const handleChainChanged = () => {
            toast({title: "Network Changed", description: "Please ensure you are on the correct network. Reloading..."});
            window.location.reload();
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
            if (window.ethereum.removeListener) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const loadAccountData = useCallback(async (currentAccount: string, currentProvider: ethers.BrowserProvider) => {
    if (!currentAccount || !currentProvider) return;
    setState(prev => ({ ...prev, providerLoading: true }));
    try {
      const nativeBal = await currentProvider.getBalance(currentAccount);
      // For token balances, ideally use contract interaction, but we'll use callable for mock consistency
      const getTokenBalanceCallable = httpsCallable<{account: string}, {balance: string, stakedBalance: string, success: boolean}>(functions, 'getTokenBalance');
      const balanceResult = await getTokenBalanceCallable({ account: currentAccount });

      if (balanceResult.data.success) {
        setState(prev => ({
          ...prev,
          nativeBalance: ethers.formatEther(nativeBal),
          noruTokenBalance: balanceResult.data.balance || '0',
          stakedNoruBalance: balanceResult.data.stakedBalance || '0',
          providerLoading: false,
        }));
      } else {
        throw new Error("Failed to fetch token balances from callable function.");
      }
    } catch (error) {
      console.error('Error loading account data:', error);
      toast({ variant: "destructive", title: "Balance Error", description: "Could not load token balances." });
      setState(prev => ({ ...prev, nativeBalance: '0', noruTokenBalance: '0', stakedNoruBalance: '0', providerLoading: false }));
    }
  }, [toast]); // Added toast to dependency array

  useEffect(() => {
    if (state.isConnected && state.account && state.provider) {
      loadAccountData(state.account, state.provider);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isConnected, state.account, state.provider]); // Ensure provider is a dependency if it can change


  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        setState(prev => ({ ...prev, providerLoading: true }));
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        // Re-initialize after user connects
        await initializeProvider();
      } catch (error) {
        console.error('Error connecting wallet:', error);
        toast({ variant: "destructive", title: "Connection Failed", description: "Could not connect to wallet." });
        setState(prev => ({ ...prev, providerLoading: false }));
      }
    } else {
      toast({ variant: "destructive", title: "Wallet Not Found", description: "Please install MetaMask or another Web3 wallet." });
      setState(prev => ({ ...prev, providerLoading: false }));
    }
  };

  const disconnectWallet = () => {
    setState({
      account: null,
      nativeBalance: '0',
      noruTokenBalance: '0',
      stakedNoruBalance: '0',
      isConnected: false,
      providerLoading: false,
      actionLoading: false,
      provider: null,
      signer: null,
    });
    toast({ title: "Wallet Disconnected" });
  };
  
  const stakeTokens = async (amount: number) => {
    if (!state.account || !state.signer) throw new Error("Wallet not connected or signer not available.");
    setState(prev => ({ ...prev, actionLoading: true }));
    try {
      const stakeTokensCallable = httpsCallable(functions, 'stakeTokens');
      const result: any = await stakeTokensCallable({ amount, account: state.account });
      if (result.data.success) {
        toast({ title: "Staking Successful", description: `${amount} NORU staked (mock tx: ${result.data.transactionHash}).` });
        if (state.account && state.provider) await loadAccountData(state.account, state.provider);
      } else {
        throw new Error(result.data.message || "Staking failed via callable function.");
      }
    } catch (error: any) {
      console.error('Error staking tokens:', error);
      toast({ variant: "destructive", title: "Staking Error", description: error.message || "Failed to stake tokens." });
      throw error;
    } finally {
      setState(prev => ({ ...prev, actionLoading: false }));
    }
  };

  const unstakeTokens = async (amount: number) => {
    if (!state.account || !state.signer) throw new Error("Wallet not connected or signer not available.");
    setState(prev => ({ ...prev, actionLoading: true }));
    try {
      // Simulate calling a Firebase function (mocked on Firebase side)
      // const unstakeTokensCallable = httpsCallable(functions, 'unstakeTokens');
      // const result: any = await unstakeTokensCallable({ amount, account: state.account });
      // if (result.data.success) { ... } else { throw new Error(...) }
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      toast({ title: "Unstaking Successful (Mock)", description: `${amount} NORU unstaking request sent.` });
      if (state.account && state.provider) await loadAccountData(state.account, state.provider); // Refresh balances
    } catch (error: any) {
      console.error('Error unstaking tokens:', error);
      toast({ variant: "destructive", title: "Unstaking Error", description: error.message || "Failed to unstake tokens." });
      throw error;
    } finally {
      setState(prev => ({ ...prev, actionLoading: false }));
    }
  };

  const claimRewards = async () => {
    if (!state.account || !state.signer) throw new Error("Wallet not connected or signer not available.");
    setState(prev => ({ ...prev, actionLoading: true }));
    try {
      // Simulate calling a Firebase function (mocked on Firebase side)
      // const claimRewardsCallable = httpsCallable(functions, 'claimRewards');
      // const result: any = await claimRewardsCallable({ account: state.account });
      // if (result.data.success) { ... } else { throw new Error(...) }
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      toast({ title: "Rewards Claimed (Mock)", description: `Pending rewards claimed successfully.` });
      if (state.account && state.provider) await loadAccountData(state.account, state.provider); // Refresh balances
    } catch (error: any) {
      console.error('Error claiming rewards:', error);
      toast({ variant: "destructive", title: "Claim Rewards Error", description: error.message || "Failed to claim rewards." });
      throw error;
    } finally {
      setState(prev => ({ ...prev, actionLoading: false }));
    }
  };

  const mintDPP = async (productData: any) => {
    if (!state.account || !state.signer) throw new Error("Wallet not connected.");
    if (!mockUser?.organizationId) throw new Error("User organization ID not found."); // Use mock user for org ID
    
    setState(prev => ({ ...prev, actionLoading: true }));
    try {
      const mintDPPCallable = httpsCallable(functions, 'mintDPP');
      const result: any = await mintDPPCallable({
        organizationId: mockUser.organizationId,
        productData,
        account: state.account 
      });
      if (result.data.success) {
        toast({ title: "DPP Minted", description: `DPP for ${productData.name} minted (mock tx: ${result.data.transactionHash}).` });
      } else {
        throw new Error(result.data.message || "Minting DPP failed via callable function.");
      }
    } catch (error: any) {
      console.error('Error minting DPP:', error);
      toast({ variant: "destructive", title: "Minting Error", description: error.message || "Failed to mint DPP." });
      throw error;
    } finally {
      setState(prev => ({ ...prev, actionLoading: false }));
    }
  };


  return {
    ...state,
    connectWallet,
    disconnectWallet,
    stakeTokens,
    unstakeTokens,
    claimRewards,
    mintDPP,
    refreshData: () => {
        if (state.account && state.provider) {
            loadAccountData(state.account, state.provider);
        }
    },
  };
}
