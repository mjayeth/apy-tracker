const { chromium } = require('playwright');

// 사이트별 특화 스크래핑 함수들
async function scrapeMorphoVault(vault, page) {
  try {
    // Morpho 사이트는 동적으로 로드되므로 더 오래 기다림
    await page.waitForTimeout(10000);
    
    // Morpho 사이트의 핵심 선택자들
    const morphoSelectors = [
      'div:has-text("Net APY")',
      'span:has-text("Net APY")',
      'div:has-text("APY")',
      'span:has-text("APY")'
    ];
    
    for (const selector of morphoSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.count() > 0) {
          const text = await element.textContent();
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
    const pageText = await page.textContent('body');
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
    await page.waitForLoadState('networkidle');
    
    // Compound Blue 사이트의 핵심 선택자들
    const compoundSelectors = [
      'div:has-text("APY")',
      'span:has-text("APY")',
      'div:has-text("Rate")',
      'span:has-text("Rate")'
    ];
    
    for (const selector of compoundSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.count() > 0) {
          const text = await element.textContent();
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
        continue;
      }
    }
    
    // 페이지 텍스트에서 Compound Blue 특화 패턴 찾기
    const pageText = await page.textContent('body');
    console.log(`Compound Blue page text preview: ${pageText.substring(0, 1000)}`);
    
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
        if (apyValue >= 5 && apyValue <= 15) {
          console.log(`Found Compound Blue APY with pattern ${pattern}: ${apyValue}%`);
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
    await page.waitForLoadState('networkidle');
    
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
        const element = await page.locator(selector).first();
        if (await element.count() > 0) {
          const text = await element.textContent();
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
    const pageText = await page.textContent('body');
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
      const apyValues = allPercentages.map(match => parseFloat(match.replace('%', ''))).filter(val => val > 0 && val < 50);
      if (apyValues.length > 0) {
        const kaminoRange = apyValues.filter(val => val >= 5 && val <= 10); // Kamino 특정 범위
        if (kaminoRange.length > 0) {
          const apy = Math.max(...kaminoRange) / 100;
          console.log(`Found Kamino APY from percentage analysis: ${apy * 100}%`);
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
        const element = await page.locator(selector).first();
        if (await element.count() > 0) {
          const text = await element.textContent();
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
    const pageText = await page.textContent('body');
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

// Jupiter Lend vault 스크래핑 함수
async function scrapeJupiterVault(vault, page) {
  try {
    // Jupiter Lend 페이지는 React 앱이므로 충분한 대기 시간 필요
    await page.waitForTimeout(15000);
    await page.waitForLoadState('networkidle');
    
    // 특정 토큰의 APY를 찾기 위해 토큰 이름 추출
    const tokenName = vault.asset; // USDC, USDT, USDS
    
    console.log(`Scraping Jupiter ${tokenName} vault...`);
    
    // 페이지 텍스트에서 특정 토큰의 APY 패턴 찾기 (우선순위)
    const pageText = await page.textContent('body');
    console.log(`Jupiter page text preview: ${pageText.substring(0, 1000)}`);
    
    // Jupiter Lend 테이블에서 특정 토큰의 APY 찾기
    // 테이블 행에서 토큰 이름과 APY를 매칭하는 패턴들
    const jupiterPatterns = [
      // "USDC" 다음에 나오는 APY 패턴들 (더 정확한 매칭)
      new RegExp(`${tokenName}([^\\d]*?)(\\d+\\.?\\d*)\\s*%`, 'i'),
      new RegExp(`${tokenName}[^\\d]*(\\d+\\.?\\d*)\\s*%`, 'i'),
      // 테이블 형태에서 토큰명과 APY가 같은 행에 있는 경우 (제한된 범위)
      new RegExp(`${tokenName}[\\s\\S]{0,50}?(\\d+\\.?\\d*)\\s*%`, 'i'),
      // 일반적인 APY 패턴 (토큰명이 APY 앞에 오는 경우)
      new RegExp(`${tokenName}[^%]*(\\d+\\.?\\d*)\\s*%`, 'i')
    ];
    
    // 모든 매치를 찾아서 가장 적절한 값을 선택
    let bestApy = null;
    let bestValue = 0;
    
    for (const pattern of jupiterPatterns) {
      const matches = pageText.matchAll(new RegExp(pattern, 'gi'));
      for (const match of matches) {
        const apyValue = parseFloat(match[1]);
        // Jupiter Lend는 보통 3-15% 범위
        if (apyValue >= 3 && apyValue <= 15 && apyValue > bestValue) {
          bestValue = apyValue;
          bestApy = apyValue / 100;
          console.log(`Found Jupiter ${tokenName} APY with pattern ${pattern}: ${apyValue}%`);
        }
      }
    }
    
    if (bestApy) {
      return bestApy;
    }
    
    // 토큰별 특화 선택자들 (백업 방법)
    const tokenSelectors = [
      `div:has-text("${tokenName}")`,
      `span:has-text("${tokenName}")`,
      `[data-testid*="${tokenName.toLowerCase()}"]`,
      `[class*="${tokenName.toLowerCase()}"]`
    ];
    
    // 각 토큰 컨테이너에서 APY 찾기
    for (const selector of tokenSelectors) {
      try {
        const tokenElement = await page.locator(selector).first();
        if (await tokenElement.count() > 0) {
          // 토큰 요소의 부모 컨테이너에서 APY 찾기
          const container = tokenElement.locator('..');
          const apyElement = container.locator('div:has-text("APY"), span:has-text("APY"), div:has-text("%"), span:has-text("%")').first();
          
          if (await apyElement.count() > 0) {
            const text = await apyElement.textContent();
            const match = text.match(/(\d+\.?\d*)%/);
            if (match) {
              const apyValue = parseFloat(match[1]);
              // Jupiter Lend는 보통 3-15% 범위
              if (apyValue >= 3 && apyValue <= 15) {
                console.log(`Found Jupiter ${tokenName} APY from selector ${selector}: ${apyValue}%`);
                return apyValue / 100;
              }
            }
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error scraping Jupiter vault ${vault.name}:`, error.message);
    return null;
  }
}

// Euler vault 스크래핑 함수 (최적화된 버전)
async function scrapeEulerVault(vault, page) {
  try {
    // 페이지가 완전히 로드될 때까지 충분히 대기
    await page.waitForTimeout(15000);
    await page.waitForLoadState('networkidle');
    
    // pufETH vault의 경우 더 구체적인 선택자 사용
    if (vault.name.includes('pufETH')) {
      console.log('Scraping pufETH vault with enhanced selectors...');
      
      // pufETH vault 페이지에서 실제 APY를 찾기 위한 구체적인 선택자들
      const pufethSelectors = [
        // Supply APY를 우선적으로 찾는 선택자들
        'div:has-text("Supply APY")',
        'span:has-text("Supply APY")',
        // 더 구체적인 선택자들
        '[data-testid="vault-apy"]',
        '[data-testid="apy-value"]',
        '[data-testid="supply-apy"]',
        '.vault-apy',
        '.apy-value',
        '.supply-apy',
        '.rate',
        '.yield',
        // Euler 특화 선택자들
        'div[class*="apy"]',
        'span[class*="apy"]',
        'div[class*="rate"]',
        'span[class*="rate"]',
        'div[class*="yield"]',
        'span[class*="yield"]',
        // 일반적인 APY 선택자들 (마지막에 배치)
        'div:has-text("APY")',
        'span:has-text("APY")',
        'div:has-text("Rate")',
        'span:has-text("Rate")'
      ];
      
      // 선택자 기반 스크래핑을 우회하고 페이지 텍스트에서 직접 찾기
      // (선택자가 잘못된 요소를 선택하는 문제가 있음)
      
      // pufETH vault 특화 패턴 찾기 (페이지 전체 텍스트에서)
      const pageText = await page.textContent('body');
      console.log('pufETH page text preview:', pageText.substring(0, 1000));
      
      // Supply APY를 우선적으로 찾기 (Euler에서 가장 정확한 값)
      // 여러 패턴으로 시도
      const supplyApyPatterns = [
        /Supply APY(\d+\.?\d*)\s*%/i,  // "Supply APY6.37%" 형태
        /Supply APY[:\s]*(\d+\.?\d*)\s*%/i,  // "Supply APY: 6.37%" 형태
        /Supply APY\s*(\d+\.?\d*)\s*%/i,  // "Supply APY 6.37%" 형태
        /(\d+\.?\d*)\s*%\s*Supply APY/i  // "6.37% Supply APY" 형태
      ];
      
      for (const pattern of supplyApyPatterns) {
        const match = pageText.match(pattern);
        if (match) {
          const apyValue = parseFloat(match[1]);
          if (apyValue >= 3 && apyValue <= 20) {
            console.log(`Found pufETH Supply APY with pattern ${pattern}: ${apyValue}%`);
            return apyValue / 100;
          }
        }
      }
      
      const pufethPatterns = [
        // Supply APY 우선 패턴들
        /Supply APY(\d+\.?\d*)\s*%/i,  // "Supply APY6.37%" 형태
        /Supply APY[:\s]*(\d+\.?\d*)\s*%/i,
        /(\d+\.?\d*)\s*%\s*Supply APY/i,
        // 더 구체적인 패턴들
        /pufETH.*?(\d+\.?\d*)\s*%/i,
        /(\d+\.?\d*)\s*%.*?pufETH/i,
        /Vault APY[:\s]*(\d+\.?\d*)\s*%/i,
        /(\d+\.?\d*)\s*%\s*Vault APY/i,
        /Current APY[:\s]*(\d+\.?\d*)\s*%/i,
        /(\d+\.?\d*)\s*%\s*Current APY/i,
        // 일반적인 APY 패턴들
        /APY[:\s]*(\d+\.?\d*)\s*%/i,
        /(\d+\.?\d*)\s*%\s*APY/i
      ];
      
      // 모든 매치를 찾아서 가장 높은 값을 선택
      let bestApy = null;
      let bestValue = 0;
      
      for (const pattern of pufethPatterns) {
        const matches = pageText.matchAll(new RegExp(pattern, 'gi'));
        for (const match of matches) {
          const apyValue = parseFloat(match[1]);
          if (apyValue >= 3 && apyValue <= 20 && apyValue > bestValue) {
            bestValue = apyValue;
            bestApy = apyValue / 100;
            console.log(`Found pufETH APY with pattern ${pattern}: ${apyValue}%`);
          }
        }
      }
      
      if (bestApy) {
        return bestApy;
      }
      
      // 모든 퍼센트 값 찾기 (백업 방법)
      const allPercentages = pageText.match(/(\d+\.?\d*)\s*%/g);
      if (allPercentages) {
        const apyValues = allPercentages.map(match => parseFloat(match.replace(/\s*%/, ''))).filter(val => val > 0 && val < 50);
        if (apyValues.length > 0) {
          const pufethRange = apyValues.filter(val => val >= 5 && val <= 15); // pufETH 특정 범위
          if (pufethRange.length > 0) {
            const apy = Math.max(...pufethRange) / 100;
            console.log(`Found pufETH APY from percentage analysis: ${apy * 100}%`);
            return apy;
          }
        }
      }
    }
    
    // 일반적인 Euler vault 스크래핑 (기존 로직)
    const pageText = await page.textContent('body');
    
    // 디버깅: 페이지 텍스트 일부 출력
    console.log('Euler page text preview:', pageText.substring(0, 500));
    
    // Supply APY 패턴들 (이미지에서 보인 6.94% 형태)
    const apyPatterns = [
      /Supply APY[:\s]*(\d+\.?\d*)\s*%/i,
      /(\d+\.?\d*)\s*%\s*Supply APY/i,
      /Supply APY[:\s]*(\d+\.?\d*)/i,
      /(\d+\.?\d*)\s*%\s*Supply/i,  // "6.94 % Supply" 형태
      /(\d+\.?\d*)\s*%/,  // 단순히 숫자+% 형태
      /Supply[:\s]*(\d+\.?\d*)\s*%/i,  // "Supply: 6.94 %" 형태
      /(\d+\.?\d*)\s*%\s*Supply/i  // "6.94 % Supply" 형태
    ];
    
    for (const pattern of apyPatterns) {
      const match = pageText.match(pattern);
      if (match) {
        const apyValue = parseFloat(match[1]);
        // Euler vault는 보통 1-20% 범위
        if (apyValue >= 1 && apyValue <= 20) {
          console.log(`Found Euler Supply APY: ${apyValue}%`);
          return apyValue / 100;
        }
      }
    }
    
    // 빠른 대안: 특정 텍스트 주변에서 APY 찾기
    const supplyApyIndex = pageText.indexOf('Supply APY');
    if (supplyApyIndex !== -1) {
      const surroundingText = pageText.substring(Math.max(0, supplyApyIndex - 50), supplyApyIndex + 100);
      const apyMatch = surroundingText.match(/(\d+\.?\d*)\s*%/);
      if (apyMatch) {
        const apyValue = parseFloat(apyMatch[1]);
        if (apyValue >= 1 && apyValue <= 20) {
          console.log(`Found Euler Supply APY from surrounding text: ${apyValue}%`);
          return apyValue / 100;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error scraping Euler vault ${vault.name}:`, error.message);
    return null;
  }
}

// 통합 스크래핑 함수
async function scrapeVaultNetApy(vault) {
  const maxRetries = 2; // 최대 2번 재시도
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🌐 Scraping Net APY for ${vault.name}... (시도 ${attempt}/${maxRetries})`);
      
      const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      
      const page = await browser.newPage();
      
      // Euler vault의 경우 Cloudflare 우회를 위한 설정
      if (vault.name.includes('Euler') || vault.type === 'euler') {
        // User-Agent와 헤더 설정으로 봇 감지 우회
        await page.setExtraHTTPHeaders({
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        });
        
        await page.goto(vault.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        // Cloudflare 검증을 위한 충분한 대기 시간
        await page.waitForTimeout(8000);
      } else {
        await page.goto(vault.url, { waitUntil: 'networkidle', timeout: 30000 });
      }
      
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
      } else if (vault.name.includes('Euler') || vault.type === 'euler') {
        netApy = await scrapeEulerVault(vault, page);
      } else if (vault.name.includes('Jupiter') || vault.type === 'jupiter') {
        netApy = await scrapeJupiterVault(vault, page);
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
      console.error(`Error scraping ${vault.name} (시도 ${attempt}):`, error.message);
      
      if (attempt < maxRetries) {
        console.log(`🔄 재시도 중... (${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기 후 재시도
        continue;
      } else {
        console.log(`❌ 최대 재시도 횟수 초과: ${vault.name}`);
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
