import web3
from web3 import Web3
from web3.contract import Contract
from web3.middleware import geth_poa_middleware
import json
import time
from typing import Dict, List, Optional, Any
import asyncio
from eth_account import Account
import os

class BlockchainOracle:
    def __init__(self, provider_url: str, private_key: str, contract_address: str = None):
        self.w3 = Web3(Web3.HTTPProvider(provider_url))
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        self.account = Account.from_key(private_key)
        self.contract_address = contract_address
        self.contract: Optional[Contract] = None

    def load_contract(self, abi_path: str):
        with open(abi_path, 'r') as f:
            abi = json.load(f)
        self.contract = self.w3.eth.contract(address=self.contract_address, abi=abi)

    def get_balance(self, address: str) -> int:
        return self.w3.eth.get_balance(address)

    def estimate_gas(self, transaction: Dict) -> int:
        return self.w3.eth.estimate_gas(transaction)

    def send_transaction(self, to_address: str, value: int, data: bytes = b'') -> str:
        nonce = self.w3.eth.get_transaction_count(self.account.address)
        gas_price = self.w3.eth.gas_price

        transaction = {
            'nonce': nonce,
            'to': to_address,
            'value': value,
            'gas': 200000,
            'gasPrice': gas_price,
            'data': data,
            'chainId': self.w3.eth.chain_id
        }

        signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        return tx_hash.hex()

    def wait_for_transaction(self, tx_hash: str, timeout: int = 120) -> Dict:
        return self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=timeout)

    async def submit_weather_data(self, city: str, temperature: float, humidity: float, timestamp: int):
        if not self.contract:
            raise ValueError("Contract not loaded")

        data_hash = self.w3.keccak(text=f"{city}{temperature}{humidity}{timestamp}")
        nonce = self.w3.eth.get_transaction_count(self.account.address)

        transaction = self.contract.functions.submitData(
            city,
            int(temperature * 100),
            int(humidity * 100),
            timestamp,
            data_hash
        ).build_transaction({
            'chainId': self.w3.eth.chain_id,
            'gas': 300000,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': nonce,
        })

        signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)

        receipt = self.wait_for_transaction(tx_hash.hex())
        return receipt

    def get_weather_data(self, city: str) -> Dict:
        if not self.contract:
            raise ValueError("Contract not loaded")

        return self.contract.functions.getLatestData(city).call()

    def get_oracle_stake(self, address: str) -> int:
        if not self.contract:
            raise ValueError("Contract not loaded")

        return self.contract.functions.getStake(address).call()

    def stake_tokens(self, amount: int) -> str:
        if not self.contract:
            raise ValueError("Contract not loaded")

        nonce = self.w3.eth.get_transaction_count(self.account.address)

        transaction = self.contract.functions.stake(amount).build_transaction({
            'chainId': self.w3.eth.chain_id,
            'gas': 200000,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': nonce,
        })

        signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)

        return tx_hash.hex()

    def unstake_tokens(self, amount: int) -> str:
        if not self.contract:
            raise ValueError("Contract not loaded")

        nonce = self.w3.eth.get_transaction_count(self.account.address)

        transaction = self.contract.functions.unstake(amount).build_transaction({
            'chainId': self.w3.eth.chain_id,
            'gas': 200000,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': nonce,
        })

        signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)

        return tx_hash.hex()

    def get_dispute_count(self, data_hash: bytes) -> int:
        if not self.contract:
            raise ValueError("Contract not loaded")

        return self.contract.functions.getDisputeCount(data_hash).call()

    def submit_dispute(self, data_hash: bytes, reason: str) -> str:
        if not self.contract:
            raise ValueError("Contract not loaded")

        nonce = self.w3.eth.get_transaction_count(self.account.address)

        transaction = self.contract.functions.submitDispute(data_hash, reason).build_transaction({
            'chainId': self.w3.eth.chain_id,
            'gas': 250000,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': nonce,
        })

        signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)

        return tx_hash.hex()

    def get_reward_balance(self) -> int:
        if not self.contract:
            raise ValueError("Contract not loaded")

        return self.contract.functions.getRewardBalance(self.account.address).call()

    def claim_rewards(self) -> str:
        if not self.contract:
            raise ValueError("Contract not loaded")

        nonce = self.w3.eth.get_transaction_count(self.account.address)

        transaction = self.contract.functions.claimRewards().build_transaction({
            'chainId': self.w3.eth.chain_id,
            'gas': 150000,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': nonce,
        })

        signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)

        return tx_hash.hex()

    def get_network_stats(self) -> Dict:
        return {
            'block_number': self.w3.eth.block_number,
            'gas_price': self.w3.eth.gas_price,
            'chain_id': self.w3.eth.chain_id,
            'is_connected': self.w3.is_connected()
        }