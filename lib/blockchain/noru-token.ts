
// src/lib/blockchain/noru-token.ts
/**
 * @fileOverview Utilities for interacting with the NORU utility token smart contract
 * from the frontend. This would involve using a Web3 library like ethers.js
 * and the contract's ABI and address.
 */

import { ethers, type Contract, type Signer, type Provider } from 'ethers';
import { getContractsForNetwork, type NetworkContracts } from './contracts'; // Assuming this provides ABI and address

class NoruTokenService {
  private contract: Contract | null = null;
  private readOnlyContract: Contract | null = null; // For read operations without signer
  private contractsConfig: NetworkContracts;

  constructor(provider: Provider, signer?: Signer) {
    // Determine network or pass it as an argument
    const networkName = 'polygon_mumbai'; // Example, should be dynamic
    this.contractsConfig = getContractsForNetwork(networkName);
    
    if (this.contractsConfig.noruTokenContract) {
        this.readOnlyContract = new ethers.Contract(
            this.contractsConfig.noruTokenContract.address,
            this.contractsConfig.noruTokenContract.abi,
            provider
        );
        if (signer) {
            this.contract = new ethers.Contract(
                this.contractsConfig.noruTokenContract.address,
                this.contractsConfig.noruTokenContract.abi,
                signer
            );
        } else {
            this.contract = this.readOnlyContract; // Fallback to read-only if no signer
        }
    }
  }

  private ensureContract(requireSigner: boolean = false): Contract {
    if (requireSigner && (!this.contract || !this.contract.runner || !('signTransaction' in this.contract.runner))) {
        throw new Error("NoruTokenService: Signer is required for this operation, but not available.");
    }
    if (!this.contract && !this.readOnlyContract) {
        throw new Error("NoruTokenService: Contract not initialized. Check ABI and address configuration.");
    }
    return requireSigner ? this.contract! : (this.contract || this.readOnlyContract)!;
  }

  async getBalance(address: string): Promise<string> {
    const contract = this.ensureContract();
    const balanceWei = await contract.balanceOf(address);
    return ethers.formatEther(balanceWei);
  }

  async approveSpender(spenderAddress: string, amountEther: string): Promise<string /* transactionHash */> {
    const contract = this.ensureContract(true);
    const amountWei = ethers.parseEther(amountEther);
    const tx = await contract.approve(spenderAddress, amountWei);
    await tx.wait();
    return tx.hash;
  }

  async transfer(toAddress: string, amountEther: string): Promise<string /* transactionHash */> {
    const contract = this.ensureContract(true);
    const amountWei = ethers.parseEther(amountEther);
    const tx = await contract.transfer(toAddress, amountWei);
    await tx.wait();
    return tx.hash;
  }
  
  async getAllowance(ownerAddress: string, spenderAddress: string): Promise<string> {
    const contract = this.ensureContract();
    const allowanceWei = await contract.allowance(ownerAddress, spenderAddress);
    return ethers.formatEther(allowanceWei);
  }

  getAddress(): string {
    return this.contractsConfig.noruTokenContract.address;
  }
}

// Example instantiation (provider/signer would come from wallet connection)
// let noruTokenServiceInstance: NoruTokenService | null = null;
// export function getNoruTokenService(provider: Provider, signer?: Signer): NoruTokenService {
//   if (!noruTokenServiceInstance || 
//       (signer && noruTokenServiceInstance.contract?.runner !== signer) || // Re-init if signer changes
//       (!signer && noruTokenServiceInstance.contract?.runner)) { // Re-init if signer removed
//     noruTokenServiceInstance = new NoruTokenService(provider, signer);
//   }
//   return noruTokenServiceInstance;
// }

export { NoruTokenService };
