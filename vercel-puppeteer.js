/**
 * Vercel-optimized Puppeteer Scraper
 * Chrome AWS Lambda Layer를 사용하여 Vercel에서 작동
 */

const puppeteer = require('puppeteer');

// Vercel 환경에서 작동하는 브라우저 설정
async function createBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--single-process',
      '--disable-extensions'
    ],
    executablePath: process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable'
  });
  
  return browser;
}

// 사이트별 특화 스크래핑 함수들
async function scrapeMorphoVault(vault, page) {
  try {
    await page.waitForTimeout(8000);
    
    // Morpho 사이트의 특정 선택자들
    const morphoSelectors = [
      '[data-testid="net-apy"]',
      '[data-testid="apy"]',
      '.net-apy',
      '.apy',
      'div:has-text("Net APY")',
      'span:has-text("Net APY")'
    ];
    
    for (const selector of morphoSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await page.evaluate(el => el.textContent, element);
          const match = text.match(/(\d+\.?\d*)%/);
          if (match) {
            const apyValue = parseFloat(match[1]);
            if (apyValue >= 5 && apyValue <= 25) {
              console.log(`Found Morpho APY: ${apyValue}%`);
              return apyValue / 100;
            }
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    // 페이지 텍스트에서 패턴 찾기
    const pageText = await page.evaluate(() => document.body.textContent);
    const patterns = [
      /Net APY\s*(\d+\.?\d*)%/i,
      /(\d+\.?\d*)%\s*Net APY/i,
      /APY\s*(\d+\.?\d*)%/i
    ];
    
    for (const pattern of patterns) {
      const match = pageText.match(pattern);
      if (match) {
        const apyValue = parseFloat(match[1]);
        if (apyValue >= 5 && apyValue <= 25) {
          console.log(`Found APY with pattern: ${apyValue}%`);
          return apyValue / 100;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error scraping Morpho vault:`, error.message);
    return null;
  }
}

async function scrapeKaminoVault(vault, page) {
  try {
    await page.waitForTimeout(10000);
    
    // Kamino 사이트의 특정 선택자들
    const kaminoSelectors = [
      'text=Supply APY',
      'text=APY',
      '[data-testid="apy"]',
      '.apy',
      '.supply-apy'
    ];
    
    for (const selector of kaminoSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await page.evaluate(el => el.textContent, element);
          const match = text.match(/(\d+\.?\d*)%/);
          if (match) {
            const apyValue = parseFloat(match[1]);
            if (apyValue >= 3 && apyValue <= 15) {
              console.log(`Found Kamino APY: ${apyValue}%`);
              return apyValue / 100;
            }
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    // 페이지 텍스트에서 패턴 찾기
    const pageText = await page.evaluate(() => document.body.textContent);
    const patterns = [
      /(\d+\.?\d*)%Supply APY/i,
      /Supply APY\s*(\d+\.?\d*)%/i,
      /APY\s*(\d+\.?\d*)%/i
    ];
    
    for (const pattern of patterns) {
      const match = pageText.match(pattern);
      if (match) {
        const apyValue = parseFloat(match[1]);
        if (apyValue >= 3 && apyValue <= 15) {
          console.log(`Found Kamino APY: ${apyValue}%`);
          return apyValue / 100;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error scraping Kamino vault:`, error.message);
    return null;
  }
}

async function scrapeAmnisVault(vault, page) {
  try {
    await page.waitForTimeout(6000);
    
    // Amnis 사이트의 특정 선택자들
    const amnisSelectors = [
      'text=APR',
      '[data-testid="apr"]',
      '.apr'
    ];
    
    for (const selector of amnisSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await page.evaluate(el => el.textContent, element);
          const match = text.match(/(\d+\.?\d*)%/);
          if (match) {
            const aprValue = parseFloat(match[1]);
            if (aprValue >= 5 && aprValue <= 15) {
              console.log(`Found Amnis APR: ${aprValue}%`);
              return aprValue / 100;
            }
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    // 페이지 텍스트에서 패턴 찾기
    const pageText = await page.evaluate(() => document.body.textContent);
    const patterns = [
      /APR\s*(\d+\.?\d*)%/i,
      /(\d+\.?\d*)%\s*APR/i
    ];
    
    for (const pattern of patterns) {
      const match = pageText.match(pattern);
      if (match) {
        const aprValue = parseFloat(match[1]);
        if (aprValue >= 5 && aprValue <= 15) {
          console.log(`Found Amnis APR: ${aprValue}%`);
          return aprValue / 100;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error scraping Amnis vault:`, error.message);
    return null;
  }
}

// 통합 스크래핑 함수
async function scrapeVaultNetApy(vault) {
  let browser = null;
  
  try {
    console.log(`🌐 Scraping Net APY for ${vault.name}...`);
    
    browser = await createBrowser();
    const page = await browser.newPage();
    
    // User-Agent 설정
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    await page.goto(vault.url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    let netApy = null;
    
    // 사이트별 특화 스크래핑
    if (vault.name.includes('Morpho') || vault.name.includes('OpenEden') || vault.name.includes('Smokehouse') || 
        vault.name.includes('Alphaping') || vault.name.includes('Steakhouse') || vault.name.includes('Hyperithm') || 
        vault.name.includes('Relend') || vault.name.includes('Yearn') || vault.name.includes('Ouroboros')) {
      netApy = await scrapeMorphoVault(vault, page);
    } else if (vault.name.includes('Kamino') || vault.name.includes('SOL')) {
      netApy = await scrapeKaminoVault(vault, page);
    } else if (vault.name.includes('Amnis') || vault.name.includes('APT')) {
      netApy = await scrapeAmnisVault(vault, page);
    }
    
    if (netApy) {
      return {
        name: vault.name,
        address: vault.address,
        asset: vault.asset,
        netApy: netApy,
        source: 'web_scraping',
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
    console.error(`Error scraping ${vault.name}:`, error.message);
    return {
      name: vault.name,
      address: vault.address,
      asset: vault.asset,
      netApy: 'Error',
      source: 'error',
      url: vault.url
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 모든 vault의 Net APY를 웹 스크래핑으로 조회
async function scrapeAllVaultsNetApy(vaults) {
  const results = [];
  
  for (const vault of vaults) {
    const result = await scrapeVaultNetApy(vault);
    results.push(result);
  }
  
  return results;
}

module.exports = { 
  scrapeVaultNetApy, 
  scrapeAllVaultsNetApy 
}; 