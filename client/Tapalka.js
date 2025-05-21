const totalCoinsDisplay = document.querySelector('.stats-container div:first-child');
const userCoinsDisplay = document.querySelector('.user-info span:last-child');
const clickButton = document.querySelector('.game-button');
const shop = document.querySelector('.shop');

function updateBalanceDisplay(balance) {
  totalCoinsDisplay.innerHTML = `💰 ${balance}<br>Total ClickCoins`;
  userCoinsDisplay.innerHTML = `💰 ${balance}`;
}

async function autoLogin() {
  try {
    const email = 'test@example.com';
    const password = 'testpassword';

    let res = await fetch('http://localhost:3000/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (res.status === 401) {
      await fetch('http://localhost:3000/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      res = await fetch('http://localhost:3000/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
    }

    const data = await res.json();
    console.log("✅ Логін успішний:", data.token);
    return true;
  } catch (err) {
    console.error("❌ Помилка входу:", err);
    return false;
  }
}

async function startGame() {
  const loggedIn = await autoLogin();
  if (!loggedIn) {
    alert('Помилка входу. Спробуйте пізніше.');
    return;
  }

  // Клік
  clickButton.addEventListener('click', async () => {
    try {
      const res = await fetch('http://localhost:3000/click', { method: 'POST' });
      const data = await res.json();
      if (res.ok) updateBalanceDisplay(data.balance);
    } catch (err) {
      console.error("Помилка при кліку:", err);
    }
  });

  // Пасивний дохід
  setInterval(async () => {
    try {
      const res = await fetch('http://localhost:3000/passive-income', { method: 'POST' });
      const data = await res.json();
      if (res.ok) updateBalanceDisplay(data.balance);
    } catch (err) {
      console.error("Помилка пасивного доходу:", err);
    }
  }, 1000);

  // Завантаження апгрейдів
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

        shop.appendChild(item);
      });
    });
}

startGame();
