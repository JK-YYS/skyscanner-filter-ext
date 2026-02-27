document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['maxPrice', 'latestTime'], (res) => {
    if(res.maxPrice) document.getElementById('maxPrice').value = res.maxPrice;
    if(res.latestTime) document.getElementById('latestTime').value = res.latestTime;
  });

  document.getElementById('saveBtn').onclick = () => {
    chrome.storage.local.set({
      maxPrice: document.getElementById('maxPrice').value,
      latestTime: document.getElementById('latestTime').value
    }, () => { alert('已存檔！請重整網頁。'); });
  };
});