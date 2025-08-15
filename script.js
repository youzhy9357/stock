let currentProfitIndex = 0;
let currentLossIndex = 0;
let buyPrice = 0;
let shares = 0;
let feeRate = 0;
let taxRate = 0;
let tick = 0;

function getTickSize(price) {
    if (price < 10) return 0.01;
    if (price < 50) return 0.05;
    if (price < 100) return 0.1;
    if (price < 500) return 0.5;
    if (price < 1000) return 1;
    return 5;
}

function calculateAndRender(sellPrice) {
    const buyCost = buyPrice * shares;
    const buyFee = Math.max(20, buyCost * feeRate);
    const sellFee = Math.max(20, sellPrice * shares * feeRate);
    const tax = sellPrice * shares * taxRate;
    const profit = (sellPrice * shares) - buyCost - buyFee - sellFee - tax;
    return {
        sellPrice: sellPrice.toFixed(2),
        profit: profit.toFixed(2),
        profitClass: profit > 0 ? 'profit' : profit < 0 ? 'loss' : ''
    };
}

function renderTableRows(tableId, startIndex, endIndex, prepend = false, reverseOrder = false) {
    const tableBody = document.getElementById(tableId);
    let htmlRows = '';
    
    // 獲利價格由大到小，虧損價格由小到大
    if (reverseOrder) {
        for (let i = endIndex; i >= startIndex; i--) {
            const sellPrice = buyPrice + (i * tick);
            const result = calculateAndRender(sellPrice);
            htmlRows += `<tr><td>$${result.sellPrice}</td><td class="${result.profitClass}">$${result.profit}</td></tr>`;
        }
    } else {
        for (let i = startIndex; i <= endIndex; i++) {
            const sellPrice = buyPrice + (i * tick);
            const result = calculateAndRender(sellPrice);
            htmlRows += `<tr><td>$${result.sellPrice}</td><td class="${result.profitClass}">$${result.profit}</td></tr>`;
        }
    }

    if (prepend) {
        tableBody.innerHTML = htmlRows + tableBody.innerHTML;
    } else {
        tableBody.innerHTML += htmlRows;
    }
    
    // 重新為奇偶行設定背景色
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        if (index % 2 === 0) {
            row.style.backgroundColor = '#f9fbfd';
        } else {
            row.style.backgroundColor = '#ffffff';
        }
    });
}

document.getElementById('calculateBtn').addEventListener('click', function() {
    buyPrice = parseFloat(document.getElementById('buyPrice').value);
    shares = parseInt(document.getElementById('shares').value);
    feeRate = parseFloat(document.getElementById('feeRate').value) / 100;
    const tradeType = document.getElementById('tradeType').value;
    
    if (tradeType === 'dayTrade') {
        taxRate = 0.0015;
    } else {
        taxRate = 0.003;
    }

    if (isNaN(buyPrice) || isNaN(shares) || shares <= 0) {
        alert('請輸入有效的買進價格和交易股數，股數必須大於0。');
        return;
    }

    tick = getTickSize(buyPrice);
    const buyCost = buyPrice * shares;
    const buyFee = Math.max(20, buyCost * feeRate);
    const breakEvenPrice = (buyCost + buyFee) / (shares - (shares * feeRate) - (shares * taxRate));
    
    const centralTickIndex = Math.round((breakEvenPrice - buyPrice) / tick);

    document.getElementById('profitTableBody').innerHTML = '';
    document.getElementById('lossTableBody').innerHTML = '';

    // 獲利結果：賣出價格由大到小
    currentProfitIndex = centralTickIndex + 4; // 初始只顯示5筆
    renderTableRows('profitTableBody', centralTickIndex, currentProfitIndex, false, true);

    // 虧損結果：賣出價格由小到大
    currentLossIndex = centralTickIndex - 5;
    renderTableRows('lossTableBody', currentLossIndex, centralTickIndex - 1, false, false);

    document.getElementById('showMoreProfitBtn').style.display = 'inline';
    document.getElementById('showMoreLossBtn').style.display = 'inline';
});

document.getElementById('showMoreProfitBtn').addEventListener('click', function() {
    const nextStartIndex = currentProfitIndex + 1;
    const nextEndIndex = currentProfitIndex + 5;
    renderTableRows('profitTableBody', nextStartIndex, nextEndIndex, true, true);
    currentProfitIndex = nextEndIndex;
});

document.getElementById('showMoreLossBtn').addEventListener('click', function() {
    const nextStartIndex = currentLossIndex - 5;
    const nextEndIndex = currentLossIndex - 1;
    renderTableRows('lossTableBody', nextStartIndex, nextEndIndex, true, false);
    currentLossIndex = nextStartIndex;
});
