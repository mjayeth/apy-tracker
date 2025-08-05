/**
 * Morpho Protocol API Integration
 * 
 * Compound Blue vaults의 Net APY를 Morpho API를 통해 조회합니다.
 * GraphQL을 사용하여 정확한 데이터를 가져옵니다.
 */

const { GraphQLClient, gql } = require('graphql-request');

const MORPHO_API_URL = 'https://api.morpho.org/graphql';
const client = new GraphQLClient(MORPHO_API_URL);

// Net APY 조회를 위한 GraphQL 쿼리
const GET_VAULT_NET_APY = gql`
  query GetVaultNetApy($address: String!, $chainId: Int!) {
    vaultByAddress(address: $address, chainId: $chainId) {
      address
      name
      asset {
        symbol
      }
      state {
        netApy
      }
    }
  }
`;

/**
 * 단일 vault의 Net APY를 조회합니다.
 * @param {string} vaultAddress - vault 주소
 * @param {number} chainId - 블록체인 네트워크 ID
 * @returns {Object|null} vault 정보와 Net APY
 */
async function getVaultNetApy(vaultAddress, chainId = 1) {
  try {
    console.log(`🔗 Fetching Net APY for vault ${vaultAddress} on chain ${chainId}...`);
    const data = await client.request(GET_VAULT_NET_APY, { 
      address: vaultAddress, 
      chainId: chainId 
    });
    
    if (data.vaultByAddress) {
      const netApy = data.vaultByAddress.state?.netApy;
      if (netApy !== null && netApy !== undefined) {
        console.log(`✅ Success: ${data.vaultByAddress.name} - Net APY: ${(netApy * 100).toFixed(2)}%`);
        return { 
          name: data.vaultByAddress.name,
          address: data.vaultByAddress.address,
          asset: data.vaultByAddress.asset?.symbol,
          netApy: netApy,
          source: 'morpho_api'
        };
      } else {
        console.log(`❌ No Net APY data for ${data.vaultByAddress.name}`);
        return null;
      }
    } else {
      console.log(`❌ Vault not found: ${vaultAddress}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching vault ${vaultAddress}:`, error.message);
    return null;
  }
}

/**
 * Compound Blue vaults의 Net APY를 일괄 조회합니다.
 * @param {Array} vaults - 전체 vault 목록
 * @returns {Array} Compound Blue vaults의 Net APY 결과
 */
async function getCompoundBlueVaultsApy(vaults) {
  console.log('🔗 Fetching Compound Blue vaults via Morpho API...\n');
  
  const compoundVaults = vaults.filter(vault => vault.type === 'compound_blue');
  const results = [];
  
  for (const vault of compoundVaults) {
    const result = await getVaultNetApy(vault.address, vault.chainId);
    if (result) {
      results.push({ 
        ...result, 
        name: vault.name, // vault 설정의 이름 사용
        url: vault.url 
      });
    } else {
      results.push({ 
        name: vault.name, 
        address: vault.address, 
        asset: vault.asset, 
        netApy: 'Error', 
        source: 'error',
        url: vault.url 
      });
    }
  }
  
  return results;
}

module.exports = { 
  getVaultNetApy, 
  getCompoundBlueVaultsApy, 
  MORPHO_API_URL 
}; 