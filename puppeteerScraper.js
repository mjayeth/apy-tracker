/**
 * Puppeteer-based Web Scraper for Vercel
 * 
 * Vercel 환경에서 안정적으로 작동하는 Puppeteer 기반 스크래퍼입니다.
 */

const puppeteer = require('puppeteer');

// 사이트별 특화 스크래핑 함수들
async function scrapeMorphoVault(vault, page) {
  try {
    // Morpho 사이트는 동적으로 로드되므로 더 오래 기다림
    await page.waitForTimeout(10000);
    
    // Morpho 사이트의 특정 선택자들
    const morphoSelectors = [
      '[data-testid="net-apy"]',
      '[data-testid="apy"]',
      '.net-apy',
      '.apy',
      'div:has-text("Net APY")',
      'span:has-text("Net APY")',
      'div:has-text("APY")',
      'span:has-text("APY")'
    ];
    
    for (const selector of morphoSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await page.evaluate(el => el.textContent, element);
          const match = text.match(/(\d+\.?\d*)%/);
          if (match) {
            const apyValue = parseFloat(match[1]);
            if (apyValue >= 5 && apyValue <= 25) { // Morpho는 보통 5-25% 범위
              console.log(`Found Morpho APY from selector ${selector}: ${apyValue}%`);
              return apyValue / 100;
            }
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    // 페이지 텍스트에서 Morpho 특화 패턴 찾기
    const pageText = await page.evaluate(() => document.body.textContent);
    const morphoPatterns = [
      /Net APY\s*(\d+\.?\d*)%/i,
      /(\d+\.?\d*)%\s*Net APY/i,
      /APY\s*(\d+\.?\d*)%/i,
      /(\d+\.?\d*)%\s*APY/i
    ];
    
    for (const pattern of morphoPatterns) {
      const match = pageText.match(pattern);
      if (match) {
        const apyValue = parseFloat(match[1]);
        if (apyValue >= 5 && apyValue <= 25) {
          console.log(`Found Morpho APY with pattern ${pattern}: ${apyValue}%`);
          return apyValue / 100;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error scraping Morpho vault ${vault.name}:`, error.message);
    return null;
  }
}

async function scrapeCompoundBlueVault(vault, page) {
  try {
    // Compound Blue는 React 앱이므로 더 오래 기다림
    await page.waitForTimeout(15000);
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForNetworkIdle();
    
    // Compound Blue 사이트의 특정 선택자들 (더 구체적으로)
    const compoundSelectors = [
      '[data-testid="apy"]',
      '[data-testid="rate"]',
      '[data-testid="yield"]',
      '.apy',
      '.rate',
      '.yield',
      'div:has-text("APY")',
      'span:has-text("APY")',
      'div:has-text("Rate")',
      'span:has-text("Rate")'
    ];
    
    for (const selector of compoundSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await page.evaluate(el => el.textContent, element);
          console.log(`Compound Blue selector ${selector} text: "${text}"`);
          const match = text.match(/(\d+\.?\d*)%/);
          if (match) {
            const apyValue = parseFloat(match[1]);
            if (apyValue >= 5 && apyValue <= 15) { // Compound Blue는 보통 5-15% 범위
              console.log(`Found Compound Blue APY from selector ${selector}: ${apyValue}%`);
              return apyValue / 100;
            }
          }
        }
      } catch (e) {
        // 다음 선택자 시도
        continue;
      }
    }
    
    // 만약 위 방법이 실패하면, 페이지 전체에서 APY 패턴 찾기
    const pageText = await page.evaluate(() => document.body.textContent);
    console.log(`Compound Blue page text preview: ${pageText.substring(0, 1000)}`);
    
    // APY 패턴들을 더 정확하게 찾기
    const compoundPatterns = [
      /APY\s*(\d+\.?\d*)%/i,
      /(\d+\.?\d*)%\s*APY/i,
      /Rate\s*(\d+\.?\d*)%/i,
      /(\d+\.?\d*)%\s*Rate/i
    ];
    
    for (const pattern of compoundPatterns) {
      const match = pageText.match(pattern);
      if (match) {
        const apyValue = parseFloat(match[1]);
        if (apyValue > 0 && apyValue < 50) { // 합리적인 범위
          console.log(`Found APY with pattern ${pattern}: ${apyValue}%`);
          return apyValue / 100;
        }
      }
    }
    
    // 모든 퍼센트 값 찾기
    const allPercentages = pageText.match(/(\d+\.?\d*)%/g);
    if (allPercentages) {
      const apyValues = allPercentages.map(match => parseFloat(match.replace('%', ''))).filter(val => val > 0 && val < 50);
      if (apyValues.length > 0) {
        const compoundBlueRange = apyValues.filter(val => val >= 7 && val <= 12); // Compound Blue 특정 범위
        if (compoundBlueRange.length > 0) {
          const apy = Math.max(...compoundBlueRange) / 100;
          console.log(`Found Compound Blue APY from percentage analysis: ${apy * 100}%`);
          return apy;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error scraping Compound Blue vault ${vault.name}:`, error.message);
    return null;
  }
}

async function scrapeKaminoVault(vault, page) {
  try {
    await page.waitForTimeout(15000);
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForNetworkIdle();
    
    // Kamino 사이트의 특정 선택자들 (더 구체적으로)
    const kaminoSelectors = [
      'text=Supply APY',
      'text=APY',
      '[data-testid="apy"]',
      '[data-testid="supply-apy"]',
      '.apy',
      '.supply-apy',
      '.rate',
      '.yield'
    ];
    
    for (const selector of kaminoSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await page.evaluate(el => el.textContent, element);
          console.log(`Kamino selector ${selector} text: "${text}"`);
          const match = text.match(/(\d+\.?\d*)%/);
          if (match) {
            const apyValue = parseFloat(match[1]);
            if (apyValue >= 3 && apyValue <= 15) { // Kamino는 보통 3-15% 범위
              console.log(`Found Kamino APY from selector ${selector}: ${apyValue}%`);
              return apyValue / 100;
            }
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    // 페이지 텍스트에서 Kamino 특화 패턴 찾기
    const pageText = await page.evaluate(() => document.body.textContent);
    console.log(`Kamino page text preview: ${pageText.substring(0, 1000)}`);
    
    // Kamino에서 "7.40%Supply APY" 같은 패턴을 찾기 위해 더 구체적인 패턴 사용
    const kaminoPatterns = [
      /(\d+\.?\d*)%Supply APY/i,  // "7.40%Supply APY" 패턴
      /Supply APY\s*(\d+\.?\d*)%/i,  // "Supply APY 7.40%" 패턴
      /(\d+\.?\d*)%\s*Supply APY/i,  // "7.40% Supply APY" 패턴
      /APY\s*(\d+\.?\d*)%/i,
      /(\d+\.?\d*)%\s*APY/i
    ];
    
    // 모든 매치를 찾아서 가장 높은 값을 선택
    let bestApy = null;
    let bestValue = 0;
    
    for (const pattern of kaminoPatterns) {
      const matches = pageText.matchAll(new RegExp(pattern, 'gi'));
      for (const match of matches) {
        const apyValue = parseFloat(match[1]);
        if (apyValue >= 3 && apyValue <= 15 && apyValue > bestValue) {
          bestValue = apyValue;
          bestApy = apyValue / 100;
          console.log(`Found Kamino APY with pattern ${pattern}: ${apyValue}%`);
        }
      }
    }
    
    if (bestApy) {
      return bestApy;
    }
    
    // 모든 퍼센트 값 찾기 (테스트에서 7.40%가 보였음)
    const allPercentages = pageText.match(/(\d+\.?\d*)%/g);
    if (allPercentages) {
      const apyValues = allPercentages
        .map(match => parseFloat(match.replace('%', '')))
        .filter(val => val > 0 && val < 50); // 합리적인 APY 범위
        
      if (apyValues.length > 0) {
        // Kamino는 보통 5-15% 범위
        const kaminoRange = apyValues.filter(val => val >= 5 && val <= 15);
        if (kaminoRange.length > 0) {
          const apy = Math.max(...kaminoRange) / 100; // 가장 높은 값 선택
          console.log(`Found Kamino APY from percentage analysis: ${apy * 100}%`);
          return apy;
        } else {
          // 범위 밖이면 가장 높은 값 선택
          const maxApy = Math.max(...apyValues);
          const apy = maxApy / 100;
          console.log(`Found APY (outside range): ${maxApy}%`);
          return apy;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error scraping Kamino vault ${vault.name}:`, error.message);
    return null;
  }
}

async function scrapeAmnisVault(vault, page) {
  try {
    await page.waitForTimeout(8000);
    
    // Amnis 사이트의 특정 선택자들
    const amnisSelectors = [
      'text=APR',
      '[data-testid="apr"]',
      '.apr',
      'div:has-text("APR")',
      'span:has-text("APR")'
    ];
    
    for (const selector of amnisSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await page.evaluate(el => el.textContent, element);
          const match = text.match(/(\d+\.?\d*)%/);
          if (match) {
            const aprValue = parseFloat(match[1]);
            if (aprValue >= 5 && aprValue <= 15) { // Amnis는 보통 5-15% 범위
              console.log(`Found Amnis APR from selector ${selector}: ${aprValue}%`);
              return aprValue / 100;
            }
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    // 페이지 텍스트에서 Amnis 특화 패턴 찾기
    const pageText = await page.evaluate(() => document.body.textContent);
    const amnisPatterns = [
      /APR\s*(\d+\.?\d*)%/i,
      /(\d+\.?\d*)%\s*APR/i
    ];
    
    for (const pattern of amnisPatterns) {
      const match = pageText.match(pattern);
      if (match) {
        const aprValue = parseFloat(match[1]);
        if (aprValue >= 5 && aprValue <= 15) {
          console.log(`Found Amnis APR with pattern ${pattern}: ${aprValue}%`);
          return aprValue / 100;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error scraping Amnis vault ${vault.name}:`, error.message);
    return null;
  }
}

// 통합 스크래핑 함수
async function scrapeVaultNetApy(vault) {
  try {
    console.log(`🌐 Scraping Net APY for ${vault.name}...`);
    
    const browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    await page.goto(vault.url, { waitUntil: 'networkidle0' });
    
    let netApy = null;
    
    // 사이트별 특화 스크래핑
    if (vault.name.includes('Morpho') || vault.name.includes('OpenEden') || vault.name.includes('Smokehouse') || 
        vault.name.includes('Alphaping') || vault.name.includes('Steakhouse') || vault.name.includes('Hyperithm') || 
        vault.name.includes('Relend') || vault.name.includes('Yearn') || vault.name.includes('Ouroboros')) {
      netApy = await scrapeMorphoVault(vault, page);
    } else if (vault.name.includes('Compound') || vault.name.includes('Gauntlet')) {
      netApy = await scrapeCompoundBlueVault(vault, page);
    } else if (vault.name.includes('Kamino') || vault.name.includes('SOL')) {
      netApy = await scrapeKaminoVault(vault, page);
    } else if (vault.name.includes('Amnis') || vault.name.includes('APT')) {
      netApy = await scrapeAmnisVault(vault, page);
    }
    
    await browser.close();
    
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
      console.log(`No Net APY found for ${vault.name}`);
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