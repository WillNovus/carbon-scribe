#![cfg(test)]

use crate::{BufferPoolContract, BufferPoolContractClient};
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup_test_env() -> (Env, Address, Address, Address, BufferPoolContractClient) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let governance = Address::generate(&env);
    let carbon_contract = Address::generate(&env);

    let contract_id = env.register_contract(None, BufferPoolContract);
    let client = BufferPoolContractClient::new(&env, &contract_id);

    (env, admin, governance, carbon_contract, client)
}

#[test]
fn test_initialize() {
    let (_, admin, governance, carbon_contract, client) = setup_test_env();

    let result = client.initialize(&admin, &governance, &carbon_contract, &500);
    assert!(result.is_ok());

    let tvl = client.get_total_value_locked();
    assert_eq!(tvl, 0);
}

#[test]
fn test_initialize_twice_fails() {
    let (_, admin, governance, carbon_contract, client) = setup_test_env();

    client.initialize(&admin, &governance, &carbon_contract, &500);
    let result = client.initialize(&admin, &governance, &carbon_contract, &500);
    
    assert!(result.is_err());
}

#[test]
fn test_deposit_as_admin() {
    let (env, admin, governance, carbon_contract, client) = setup_test_env();

    client.initialize(&admin, &governance, &carbon_contract, &500);

    let project_id = String::from_str(&env, "PROJECT-001");
    let result = client.deposit(&admin, &1, &project_id);
    
    assert!(result.is_ok());

    let tvl = client.get_total_value_locked();
    assert_eq!(tvl, 1);

    let in_pool = client.is_token_in_pool(&1);
    assert!(in_pool);
}

#[test]
fn test_deposit_duplicate_fails() {
    let (env, admin, governance, carbon_contract, client) = setup_test_env();

    client.initialize(&admin, &governance, &carbon_contract, &500);

    let project_id = String::from_str(&env, "PROJECT-001");
    client.deposit(&admin, &1, &project_id);
    
    let result = client.deposit(&admin, &1, &project_id);
    assert!(result.is_err());
}

#[test]
fn test_withdraw_by_governance() {
    let (env, admin, governance, carbon_contract, client) = setup_test_env();

    client.initialize(&admin, &governance, &carbon_contract, &500);

    let project_id = String::from_str(&env, "PROJECT-001");
    client.deposit(&admin, &1, &project_id);

    let result = client.withdraw_to_replace(&governance, &1, &999);
    assert!(result.is_ok());

    let tvl = client.get_total_value_locked();
    assert_eq!(tvl, 0);
}

#[test]
fn test_auto_deposit_calculation() {
    let (env, admin, governance, carbon_contract, client) = setup_test_env();

    client.initialize(&admin, &governance, &carbon_contract, &500);

    let project_id = String::from_str(&env, "PROJECT-001");
    
    // With 5% (500 bp), every 20th token should be deposited
    let result = client.auto_deposit(&carbon_contract, &20, &project_id, &20);
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), true);

    let result = client.auto_deposit(&carbon_contract, &21, &project_id, &21);
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), false);
}

#[test]
#[should_panic]
fn test_invalid_percentage() {
    let (_, admin, governance, carbon_contract, client) = setup_test_env();

    client.initialize(&admin, &governance, &carbon_contract, &15000);
}
