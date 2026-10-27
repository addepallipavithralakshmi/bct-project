// Centralized contract configuration
// All addresses are read from the Truffle build artifacts (build/contracts/*.json)
// deployed on Ganache local blockchain, Chain ID 1337, RPC: http://127.0.0.1:8545

import TicketsABI from '../build_contracts/Tickets.json';
import EventsABI from '../build_contracts/Events.json';
import UsersABI from '../build_contracts/Users.json';
import VenuesABI from '../build_contracts/Venues.json';

export const NETWORK_CONFIG = {
  chainId: 1337,
  chainIdHex: '0x539',
  rpcUrl: 'http://127.0.0.1:8545',
  networkName: 'Ganache Local',
};

export const CONTRACT_ADDRESSES = {
  Tickets: '0x5113ea760C47cDA3275B8401c28190889Eb82809',
  Events:  '0xF55288f486602741c6D116e5F781BCB07097277a',
  Users:   '0xD0A1f6f8Ee0A2698cAa39173ddF0660aA20F9066',
  Venues:  '0xA8b773Bb93754ab73769ecbc372054FbF4AD25d6',
};

export const CONTRACT_ABIS = {
  Tickets: TicketsABI.abi,
  Events:  EventsABI.abi,
  Users:   UsersABI.abi,
  Venues:  VenuesABI.abi,
};

/**
 * Shorten an Ethereum address to 0x1234...abcd format.
 */
export function shortenAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format Wei value to ETH string with specified decimal places.
 */
export function weiToEth(wei, decimals = 4) {
  if (!wei) return '0';
  const eth = Number(BigInt(wei)) / 1e18;
  return eth.toFixed(decimals);
}
