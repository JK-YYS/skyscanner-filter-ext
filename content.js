let scanInterval = null;

const finalKill = () => {
  // 1. 環境安全檢查
  if (!chrome.runtime?.id) {
    if (scanInterval) clearInterval(scanInterval);
    return;
  }

  // 2. 獲取使用者設定的篩選條件
  chrome.storage.local.get(['maxPrice', 'latestTime', 'airlines'], (config) => {
    if (chrome.runtime.lastError) return;

    const maxP = parseInt(config.maxPrice) || 999999;
    const [lH, lM] = (config.latestTime || "23:59").split(':').map(Number);
    const limitTotalMin = lH * 60 + lM;
    const targetAirlines = (config.airlines || "").split(',').map(s => s.trim().toLowerCase()).filter(s => s !== "");

    // 3. 定位所有機票卡片
    const allCards = document.querySelectorAll('div[class*="ResultCard"], div[class*="TicketWrapper"], [data-test-id="fcl-result-card"]');

    allCards.forEach(card => {
      const text = card.innerText;
      
      // A. 提取價格 (取最後一個 NT$ 數字，通常是總價)
      const priceMatch = text.replace(/,/g, '').match(/NT\$\s?(\d+)/g);
      const price = priceMatch ? parseInt(priceMatch[priceMatch.length - 1].replace(/[^0-9]/g, '')) : null;

      // B. 提取所有時間 (檢查去程與回程)
      const timeMatches = text.match(/(\d{2}:\d{2})/g) || [];
      const isTimeOk = timeMatches.every(time => {
        const [h, m] = time.split(':').map(Number);
        return (h * 60 + m) <= limitTotalMin;
      });

      // C. 航空公司匹配
      const isAirlineOk = targetAirlines.length === 0 || 
                          targetAirlines.some(t => text.toLowerCase().includes(t));

      // 4. 執行過濾邏輯
      if (price !== null) {
        if (price <= maxP && isTimeOk && isAirlineOk) {
          // 符合條件：顯示並標示
          card.style.setProperty('display', 'block', 'important');
          card.style.border = '4px solid #00d1b2';
          card.style.borderRadius = '12px';
          card.style.opacity = '1';
        } else {
          // 不符條件：徹底隱藏
          card.style.setProperty('display', 'none', 'important');
        }
      }
    });
  });
};

// 啟動監控
scanInterval = setInterval(finalKill, 1000);