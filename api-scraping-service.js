/**
 * API 기반 스크래핑 서비스
 * Vercel에서 작동하는 대안 방법들
 */

const fetch = require('node-fetch');

// 1. ScrapingBee API 사용
async function scrapeWithScrapingBee(url, apiKey) {
  try {
    const response = await fetch(`https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(url)}&render_js=true&wait=5000`);
    const html = await response.text();
    
    // HTML에서 APY 추출
    const apyMatch = html.match(/(\d+\.?\d*)%/);
    if (apyMatch) {
      return parseFloat(apyMatch[1]) / 100;
    }
    
    return null;
  } catch (error) {
    console.error('ScrapingBee error:', error.message);
    return null;
  }
}

// 2. ScraperAPI 사용
async function scrapeWithScraperAPI(url, apiKey) {
  try {
    const response = await fetch(`http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}&render=true`);
    const html = await response.text();
    
    // HTML에서 APY 추출
    const apyMatch = html.match(/(\d+\.?\d*)%/);
    if (apyMatch) {
      return parseFloat(apyMatch[1]) / 100;
    }
    
    return null;
  } catch (error) {
    console.error('ScraperAPI error:', error.message);
    return null;
  }
}

// 3. Bright Data 사용
async function scrapeWithBrightData(url, username, password) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Proxy-Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
      }
    });
    const html = await response.text();
    
    // HTML에서 APY 추출
    const apyMatch = html.match(/(\d+\.?\d*)%/);
    if (apyMatch) {
      return parseFloat(apyMatch[1]) / 100;
    }
    
    return null;
  } catch (error) {
    console.error('Bright Data error:', error.message);
    return null;
  }
}

// 4. 무료 대안: HTML 파싱만 사용 (JavaScript 렌더링 불가)
async function scrapeWithBasicFetch(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await response.text();
    
    // 정적 HTML에서만 APY 추출 (JavaScript 렌더링된 내용은 가져올 수 없음)
    const apyMatch = html.match(/(\d+\.?\d*)%/);
    if (apyMatch) {
      return parseFloat(apyMatch[1]) / 100;
    }
    
    return null;
  } catch (error) {
    console.error('Basic fetch error:', error.message);
    return null;
  }
}

// 통합 스크래핑 함수
async function scrapeVaultWithAPI(vault, method = 'basic') {
  try {
    console.log(`🌐 API Scraping ${vault.name} with ${method}...`);
    
    let apy = null;
    
    switch (method) {
      case 'scrapingbee':
        apy = await scrapeWithScrapingBee(vault.url, process.env.SCRAPINGBEE_API_KEY);
        break;
      case 'scraperapi':
        apy = await scrapeWithScraperAPI(vault.url, process.env.SCRAPERAPI_KEY);
        break;
      case 'brightdata':
        apy = await scrapeWithBrightData(vault.url, process.env.BRIGHTDATA_USERNAME, process.env.BRIGHTDATA_PASSWORD);
        break;
      default:
        apy = await scrapeWithBasicFetch(vault.url);
    }
    
    if (apy) {
      return {
        name: vault.name,
        address: vault.address,
        asset: vault.asset,
        netApy: apy,
        source: `api_scraping_${method}`,
        url: vault.url
      };
    } else {
      return {
        name: vault.name,
        address: vault.address,
        asset: vault.asset,
        netApy: 'Error',
        source: 'error',
        url: vault.url
      };
    }
    
  } catch (error) {
    console.error(`Error API scraping ${vault.name}:`, error.message);
    return {
      name: vault.name,
      address: vault.address,
      asset: vault.asset,
      netApy: 'Error',
      source: 'error',
      url: vault.url
    };
  }
}

module.exports = {
  scrapeVaultWithAPI,
  scrapeWithScrapingBee,
  scrapeWithScraperAPI,
  scrapeWithBrightData,
  scrapeWithBasicFetch
}; 