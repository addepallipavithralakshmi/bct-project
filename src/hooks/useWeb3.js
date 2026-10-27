import { useState, useEffect, useCallback, useRef } from 'react';
import Web3 from 'web3';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, NETWORK_CONFIG } from '../config/contracts';

const RPC_URL = NETWORK_CONFIG.rpcUrl;
const CORRECT_CHAIN_ID = NETWORK_CONFIG.chainId;

/**
 * Central Web3 / wallet connection hook.
 * Returns wallet state and contract factory functions.
 */
export function useWeb3() {
  const [web3, setWeb3]                   = useState(null);
  const [account, setAccount]             = useState('');
  const [chainId, setChainId]             = useState(null);
  const [isConnecting, setIsConnecting]   = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [rpcAvailable, setRpcAvailable]   = useState(null); // null = unknown, true/false
  const web3Ref = useRef(null);

  // Derived state
  const isConnected      = Boolean(account);
  const isCorrectNetwork = chainId === CORRECT_CHAIN_ID;

  // ── Check that the local Ganache RPC is reachable ──────────────────────────
  useEffect(() => {
    const checkRpc = async () => {
      try {
        const w3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
        await w3.eth.getBlockNumber();
        setRpcAvailable(true);
      } catch {
        setRpcAvailable(false);
      }
    };
    checkRpc();
  }, []);

  // ── On mount: try to restore previous connection ───────────────────────────
  useEffect(() => {
    if (!window.ethereum) return;

    const restoreConnection = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const w3 = new Web3(window.ethereum);
          web3Ref.current = w3;
          setWeb3(w3);
          setAccount(accounts[0]);
          const cid = await w3.eth.getChainId();
          setChainId(Number(cid));
        }
      } catch {
        // No prior permission — user hasn't connected yet
      }
    };

    restoreConnection();

    // ── Listen for account / chain changes ─────────────────────────────────
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount('');
        setWeb3(null);
        web3Ref.current = null;
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (hexChainId) => {
      setChainId(parseInt(hexChainId, 16));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  // ── Connect wallet ──────────────────────────────────────────────────────────
  const connectWallet = useCallback(async () => {
    setConnectionError('');

    if (!window.ethereum) {
      setConnectionError(
        'No Ethereum wallet detected. Please install MetaMask and configure it for the local Ganache network (Chain ID 1337, RPC: http://127.0.0.1:8545).'
      );
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const w3 = new Web3(window.ethereum);
      web3Ref.current = w3;
      setWeb3(w3);
      setAccount(accounts[0]);
      const cid = await w3.eth.getChainId();
      setChainId(Number(cid));
    } catch (err) {
      if (err.code === 4001) {
        setConnectionError('Connection rejected. Please approve the wallet connection request.');
      } else {
        setConnectionError(`Connection failed: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // ── Contract factories ──────────────────────────────────────────────────────
  /**
   * Returns a contract instance. Uses window.ethereum if available (for
   * sending transactions), otherwise falls back to the HTTP provider for reads.
   */
  const getContract = useCallback((name) => {
    const abi     = CONTRACT_ABIS[name];
    const address = CONTRACT_ADDRESSES[name];
    if (!abi || !address) {
      throw new Error(`Unknown contract: ${name}`);
    }
    const w3 = web3Ref.current || new Web3(new Web3.providers.HttpProvider(RPC_URL));
    return new w3.eth.Contract(abi, address);
  }, []);

  const getTicketsContract = useCallback(() => getContract('Tickets'), [getContract]);
  const getEventsContract  = useCallback(() => getContract('Events'),  [getContract]);
  const getVenuesContract  = useCallback(() => getContract('Venues'),  [getContract]);
  const getUsersContract   = useCallback(() => getContract('Users'),   [getContract]);

  return {
    web3,
    account,
    chainId,
    isConnected,
    isCorrectNetwork,
    rpcAvailable,
    isConnecting,
    connectionError,
    connectWallet,
    getTicketsContract,
    getEventsContract,
    getVenuesContract,
    getUsersContract,
  };
}
