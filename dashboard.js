const express = require('express');
const path = require('path');
const fs = require('fs-extra'); // Added fs-extra import
const { main } = require('./index'); // Import main function for manual collection

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 메인 페이지
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoints
app.get('/api/latest', async (req, res) => {
  try {
    const data = await fs.readJson(path.join(__dirname, 'data', 'latest.json'));
    if (data) {
      res.json({ success: true, data: data });
    } else {
      res.json({ success: false, message: 'No data available.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/collect', async (req, res) => {
  try {
    console.log('🔄 Manual data collection started...');
    const results = await main(); // Call main function to collect data
    
    if (results && results.length > 0) {
      res.json({ success: true, message: `${results.length} vaults data collected`, data: results });
    } else {
      res.json({ success: false, message: 'Data collection failed.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



// Server start
app.listen(PORT, () => {
  console.log(`🚀 APY Tracker Dashboard started`);
  console.log(`📊 Access URL: http://localhost:${PORT}`);
  console.log(`📈 API Endpoints: http://localhost:${PORT}/api`);
});

module.exports = app; 