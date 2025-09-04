const { spawn } = require('child_process');

// 색상 유틸리티
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    console.log(`\n${colors.cyan}${colors.bright}[${step}]${colors.reset} ${message}`);
}

async function runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
        log(`실행: ${command} ${args.join(' ')}`, 'yellow');
        
        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
            ...options
        });

        child.on('close', (code) => {
            if (code === 0) {
                log(`✅ 성공: ${command}`, 'green');
                resolve();
            } else {
                log(`❌ 실패: ${command} (코드: ${code})`, 'red');
                reject(new Error(`Command failed with code ${code}`));
            }
        });

        child.on('error', (error) => {
            log(`❌ 오류: ${command} - ${error.message}`, 'red');
            reject(error);
        });
    });
}

async function killExistingDashboard() {
    try {
        log('🔄 기존 대시보드 프로세스 종료 중...', 'yellow');
        await runCommand('pkill', ['-f', 'node dashboard.js']);
        log('✅ 기존 프로세스 종료 완료', 'green');
        // 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
        log('ℹ️ 종료할 프로세스가 없습니다', 'blue');
    }
}

async function startDashboard() {
    logStep('2', '로컬 대시보드 시작 중...');
    
    try {
        // 기존 프로세스 종료
        await killExistingDashboard();
        
        // 대시보드 시작
        log('🚀 대시보드 서버 시작...', 'blue');
        const dashboard = spawn('npm', ['run', 'dashboard'], {
            stdio: 'inherit',
            shell: true
        });

        // 잠시 대기 후 브라우저 열기
        setTimeout(() => {
            log('\n🌐 브라우저에서 대시보드 열기...', 'blue');
            runCommand('open', ['http://localhost:3000']);
        }, 3000);

        log('\n🎉 모든 과정 완료!', 'green');
        log('==================================================', 'cyan');
        log('\n🌐 로컬 대시보드 URL:', 'blue');
        log('http://localhost:3000', 'bright');
        log('\n📊 포함된 데이터:', 'blue');
        log('- 12개 DeFi Vault의 최신 APY', 'reset');
        log('- ALPHA Hub 순서대로 정렬', 'reset');
        log('- Euler Finance pufETH/WETH Loop 포함', 'reset');
        log('\n🔄 다음 실행:', 'blue');
        log('npm run local', 'bright');
        log('\n⚠️ 대시보드를 종료하려면 Ctrl+C를 누르세요', 'yellow');

        // 프로세스가 종료될 때까지 대기
        dashboard.on('close', (code) => {
            log(`\n📱 대시보드 서버가 종료되었습니다 (코드: ${code})`, 'blue');
        });

    } catch (error) {
        log(`❌ 대시보드 시작 실패: ${error.message}`, 'red');
        throw error;
    }
}

async function main() {
    try {
        log('🚀 APY Tracker 로컬 실행 시작!', 'magenta');
        log('==================================================', 'cyan');
        
        // 1단계: APY 데이터 수집
        logStep('0', 'APY 데이터 수집 중...');
        await runCommand('npm', ['run', 'collect']);
        
        // 2단계: 로컬 대시보드 시작
        await startDashboard();
        
    } catch (error) {
        log(`\n❌ 전체 과정 실패: ${error.message}`, 'red');
        process.exit(1);
    }
}

// 스크립트 실행
if (require.main === module) {
    main();
}

module.exports = { main };
