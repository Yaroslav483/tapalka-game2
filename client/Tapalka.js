const totalCoinsDisplay = document.querySelector('.stats-container div:first-child');
const userCoinsDisplay = document.querySelector('.user-info span:last-child');
const clickButton = document.querySelector('.game-button');
const shop = document.querySelector('.shop');

function updateBalanceDisplay(balance) {
  totalCoinsDisplay.innerHTML = `💰 ${balance}<br>Total ClickCoins`;
  userCoinsDisplay.innerHTML = `💰 ${balance}`;
}


clickButton.addEventListener('click', async () => {
  try {
    const res = await fetch('http://localhost:3000/click', { method: 'POST' });
    const data = await res.json();
    if (res.ok) updateBalanceDisplay(data.balance);
  } catch (err) {
    console.error("Помилка при кліку:", err);
  }
});


setInterval(async () => {
  try {
    const res = await fetch('http://localhost:3000/passive-income', { method: 'POST' });
    const data = await res.json();
    if (res.ok) updateBalanceDisplay(data.balance);
  } catch (err) {
    console.error("Помилка пасивного доходу:", err);
  }
}, 1000);


fetch('http://localhost:3000/upgrades')
  .then(res => res.json())
  .then(upgrades => {
    shop.innerHTML = '';
    upgrades.forEach(upgrade => {
      const item = document.createElement('div');
      item.className = 'item';
      item.innerHTML = `
        <span><b>${upgrade.name}</b></span>
        <div class="ability">${upgrade.description}</div>
        <div class="price">💰 ${upgrade.price}</div>
        <button>Buy</button>
      `;

      item.querySelector('button').addEventListener('click', async () => {
        try {
          const balanceRes = await fetch('http://localhost:3000/passive-income', { method: 'POST' });
          const balanceData = await balanceRes.json();
          let balance = balanceData.balance;

          if (balance >= upgrade.price) {
            alert(`${upgrade.name} куплено! (Ефекти ще реалізуються на сервері)`);
          } else {
            alert("Недостатньо монет!");
          }

          updateBalanceDisplay(balance);
        } catch (err) {
          console.error("Помилка покупки апгрейду:", err);
        }
      });

      shop.appendChild(item);
    });
  });
item.querySelector('button').addEventListener('click', async () => {
  try {
    const res = await fetch('http://localhost:3000/buy-upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ upgradeId: upgrade.id })
    });

    const data = await res.json();

    if (res.ok) {
      alert(`${upgrade.name} куплено!`);
      updateBalanceDisplay(data.balance);
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.error('Помилка покупки:', err);
  }
});

