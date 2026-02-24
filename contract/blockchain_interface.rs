use web3::Web3;
use web3::transports::Http;
use web3::contract::{Contract, Options};
use web3::types::{Address, U256, H256, TransactionParameters, TransactionReceipt};
use std::str::FromStr;
use serde::{Serialize, Deserialize};
use std::sync::Arc;
use tokio::sync::Mutex;
use ethabi::Token;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OracleData {
    pub city: String,
    pub temperature: i64,
    pub humidity: i64,
    pub timestamp: u64,
    pub data_hash: [u8; 32],
}

#[derive(Debug)]
pub struct BlockchainInterface {
    web3: Web3<Http>,
    contract: Contract<Http>,
    account_address: Address,
    private_key: String,
}

impl BlockchainInterface {
    pub async fn new(
        provider_url: &str,
        contract_address: &str,
        private_key: String,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let transport = Http::new(provider_url)?;
        let web3 = Web3::new(transport);

        let contract_address = Address::from_str(contract_address)?;
        let contract = Contract::from_json(
            web3.eth(),
            contract_address,
            include_bytes!("../abi/WeatherOracle.json"),
        )?;

        let account_address = web3::signing::Key::from_secret(private_key.as_bytes())?.address();

        Ok(Self {
            web3,
            contract,
            account_address,
            private_key,
        })
    }

    pub async fn submit_weather_data(
        &self,
        city: String,
        temperature: f64,
        humidity: f64,
        timestamp: u64,
    ) -> Result<H256, Box<dyn std::error::Error>> {
        let temp_scaled = (temperature * 100.0) as i64;
        let humidity_scaled = (humidity * 100.0) as i64;

        let data_hash = self.calculate_data_hash(&city, temp_scaled, humidity_scaled, timestamp);

        let function_call = self.contract
            .call("submitData", (city, temp_scaled, humidity_scaled, timestamp, data_hash), self.account_address, Options::default());

        let gas_estimate = function_call.estimate_gas().await?;
        let gas_price = self.web3.eth().gas_price().await?;

        let nonce = self.web3.eth().transaction_count(self.account_address, None).await?;

        let transaction = TransactionParameters {
            to: Some(self.contract.address()),
            data: function_call.tx.data.unwrap(),
            gas: gas_estimate,
            gas_price: Some(gas_price),
            nonce: Some(nonce),
            ..Default::default()
        };

        let signed_transaction = self.web3.accounts().sign_transaction(transaction, &self.private_key);

        let tx_hash = self.web3.eth().send_raw_transaction(signed_transaction.raw_transaction).await?;

        Ok(tx_hash)
    }

    pub async fn get_weather_data(&self, city: &str) -> Result<OracleData, Box<dyn std::error::Error>> {
        let result: (String, i64, i64, u64, [u8; 32]) = self.contract
            .query("getLatestData", (city,), self.account_address, Options::default(), None)
            .await?;

        Ok(OracleData {
            city: result.0,
            temperature: result.1,
            humidity: result.2,
            timestamp: result.3,
            data_hash: result.4,
        })
    }

    pub async fn get_stake_balance(&self, address: Address) -> Result<U256, Box<dyn std::error::Error>> {
        let result: U256 = self.contract
            .query("getStake", (address,), self.account_address, Options::default(), None)
            .await?;

        Ok(result)
    }

    pub async fn stake_tokens(&self, amount: U256) -> Result<H256, Box<dyn std::error::Error>> {
        let function_call = self.contract
            .call("stake", (amount,), self.account_address, Options::default());

        let gas_estimate = function_call.estimate_gas().await?;
        let gas_price = self.web3.eth().gas_price().await?;
        let nonce = self.web3.eth().transaction_count(self.account_address, None).await?;

        let transaction = TransactionParameters {
            to: Some(self.contract.address()),
            data: function_call.tx.data.unwrap(),
            gas: gas_estimate,
            gas_price: Some(gas_price),
            nonce: Some(nonce),
            value: amount,
            ..Default::default()
        };

        let signed_transaction = self.web3.accounts().sign_transaction(transaction, &self.private_key);
        let tx_hash = self.web3.eth().send_raw_transaction(signed_transaction.raw_transaction).await?;

        Ok(tx_hash)
    }

    pub async fn unstake_tokens(&self, amount: U256) -> Result<H256, Box<dyn std::error::Error>> {
        let function_call = self.contract
            .call("unstake", (amount,), self.account_address, Options::default());

        let gas_estimate = function_call.estimate_gas().await?;
        let gas_price = self.web3.eth().gas_price().await?;
        let nonce = self.web3.eth().transaction_count(self.account_address, None).await?;

        let transaction = TransactionParameters {
            to: Some(self.contract.address()),
            data: function_call.tx.data.unwrap(),
            gas: gas_estimate,
            gas_price: Some(gas_price),
            nonce: Some(nonce),
            ..Default::default()
        };

        let signed_transaction = self.web3.accounts().sign_transaction(transaction, &self.private_key);
        let tx_hash = self.web3.eth().send_raw_transaction(signed_transaction.raw_transaction).await?;

        Ok(tx_hash)
    }

    pub async fn submit_dispute(
        &self,
        data_hash: [u8; 32],
        reason: String,
    ) -> Result<H256, Box<dyn std::error::Error>> {
        let function_call = self.contract
            .call("submitDispute", (data_hash, reason), self.account_address, Options::default());

        let gas_estimate = function_call.estimate_gas().await?;
        let gas_price = self.web3.eth().gas_price().await?;
        let nonce = self.web3.eth().transaction_count(self.account_address, None).await?;

        let transaction = TransactionParameters {
            to: Some(self.contract.address()),
            data: function_call.tx.data.unwrap(),
            gas: gas_estimate,
            gas_price: Some(gas_price),
            nonce: Some(nonce),
            ..Default::default()
        };

        let signed_transaction = self.web3.accounts().sign_transaction(transaction, &self.private_key);
        let tx_hash = self.web3.eth().send_raw_transaction(signed_transaction.raw_transaction).await?;

        Ok(tx_hash)
    }

    pub async fn get_dispute_count(&self, data_hash: [u8; 32]) -> Result<U256, Box<dyn std::error::Error>> {
        let result: U256 = self.contract
            .query("getDisputeCount", (data_hash,), self.account_address, Options::default(), None)
            .await?;

        Ok(result)
    }

    pub async fn claim_rewards(&self) -> Result<H256, Box<dyn std::error::Error>> {
        let function_call = self.contract
            .call("claimRewards", (), self.account_address, Options::default());

        let gas_estimate = function_call.estimate_gas().await?;
        let gas_price = self.web3.eth().gas_price().await?;
        let nonce = self.web3.eth().transaction_count(self.account_address, None).await?;

        let transaction = TransactionParameters {
            to: Some(self.contract.address()),
            data: function_call.tx.data.unwrap(),
            gas: gas_estimate,
            gas_price: Some(gas_price),
            nonce: Some(nonce),
            ..Default::default()
        };

        let signed_transaction = self.web3.accounts().sign_transaction(transaction, &self.private_key);
        let tx_hash = self.web3.eth().send_raw_transaction(signed_transaction.raw_transaction).await?;

        Ok(tx_hash)
    }

    pub async fn get_reward_balance(&self) -> Result<U256, Box<dyn std::error::Error>> {
        let result: U256 = self.contract
            .query("getRewardBalance", (self.account_address,), self.account_address, Options::default(), None)
            .await?;

        Ok(result)
    }

    pub async fn get_network_stats(&self) -> Result<NetworkStats, Box<dyn std::error::Error>> {
        let block_number = self.web3.eth().block_number().await?;
        let gas_price = self.web3.eth().gas_price().await?;
        let chain_id = self.web3.eth().chain_id().await?;
        let balance = self.web3.eth().balance(self.account_address, None).await?;

        Ok(NetworkStats {
            block_number,
            gas_price,
            chain_id,
            account_balance: balance,
        })
    }

    pub async fn wait_for_transaction(&self, tx_hash: H256) -> Result<TransactionReceipt, Box<dyn std::error::Error>> {
        let receipt = self.web3.eth().transaction_receipt(tx_hash).await?;

        match receipt {
            Some(rec) => Ok(rec),
            None => Err("Transaction not found".into()),
        }
    }

    fn calculate_data_hash(&self, city: &str, temperature: i64, humidity: i64, timestamp: u64) -> [u8; 32] {
        use sha3::{Digest, Sha3_256};

        let mut hasher = Sha3_256::new();
        hasher.update(city.as_bytes());
        hasher.update(&temperature.to_be_bytes());
        hasher.update(&humidity.to_be_bytes());
        hasher.update(&timestamp.to_be_bytes());

        let result = hasher.finalize();
        let mut hash = [0u8; 32];
        hash.copy_from_slice(&result);
        hash
    }

    pub async fn validate_data_integrity(&self, data: &OracleData) -> Result<bool, Box<dyn std::error::Error>> {
        let expected_hash = self.calculate_data_hash(
            &data.city,
            data.temperature,
            data.humidity,
            data.timestamp,
        );

        Ok(expected_hash == data.data_hash)
    }

    pub async fn get_contract_balance(&self) -> Result<U256, Box<dyn std::error::Error>> {
        let balance = self.web3.eth().balance(self.contract.address(), None).await?;
        Ok(balance)
    }

    pub async fn estimate_transaction_cost(&self, function_name: &str, params: Vec<Token>) -> Result<U256, Box<dyn std::error::Error>> {
        let function_call = self.contract
            .call(function_name, params, self.account_address, Options::default());

        let gas_estimate = function_call.estimate_gas().await?;
        let gas_price = self.web3.eth().gas_price().await?;

        Ok(gas_estimate * gas_price)
    }
}

#[derive(Debug, Clone)]
pub struct NetworkStats {
    pub block_number: U256,
    pub gas_price: U256,
    pub chain_id: U256,
    pub account_balance: U256,
}