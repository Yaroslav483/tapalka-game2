const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const users = [];
let currentUser = null;

function encodePassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken(email) {
  const timestamp = Date.now().toString();
  return crypto.createHash('sha256').update(email + timestamp).digest('hex');
}


app.post('/sign-up', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email і пароль обовʼязкові' });
  if (password.length < 8) return res.status(400).json({ message: 'Пароль повинен містити мінімум 8 символів' });
  if (users.find(u => u.email === email)) return res.status(400).json({ message: 'Користувач уже існує' });

  const user = {
    email,
    password: encodePassword(password),
    balance: 0,
    coinsPerClick: 1,
    passiveIncomePerSecond: 1
  };
  users.push(user);
  return res.status(201).json({ message: 'Реєстрація успішна!' });
});


app.post('/sign-in', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email і пароль обовʼязкові' });
  const user = users.find(u => u.email === email && u.password === encodePassword(password));
  if (!user) return res.status(401).json({ message: 'Невірний email або пароль' });

  currentUser = user;
  const token = generateToken(email);
  return res.status(200).json({ token });
});


app.post('/click', (req, res) => {
  if (!currentUser) return res.status(404).json({ message: 'Користувача не знайдено' });
  currentUser.balance += currentUser.coinsPerClick;
  res.status(200).json({ balance: currentUser.balance });
});


app.post('/passive-income', (req, res) => {
  if (!currentUser) return res.status(404).json({ message: 'Користувача не знайдено' });
  currentUser.balance += currentUser.passiveIncomePerSecond;
  res.status(200).json({ balance: currentUser.balance });
});

// CRUD апгрейдів
let upgrades = [];
let currentUpgradeId = 1;

function validateUpgrade(data) {
  const { name, description, price } = data;
  if (!name || typeof name !== 'string' || name.trim() === '') return 'Поле name не може бути порожнім';
  if (!description || typeof description !== 'string' || description.trim() === '') return 'Поле description не може бути порожнім';
  if (typeof price !== 'number' || price < 0) return 'Поле price має бути числом ≥ 0';
  return null;
}

app.get('/upgrades', (req, res) => res.json(upgrades));

app.get('/upgrades/:id', (req, res) => {
  const upgrade = upgrades.find(u => u.id === +req.params.id);
  if (!upgrade) return res.status(404).json({ message: 'Апгрейд не знайдено' });
  res.json(upgrade);
});

app.post('/upgrades', (req, res) => {
  const error = validateUpgrade(req.body);
  if (error) return res.status(400).json({ message: error });
  const newUpg = { id: currentUpgradeId++, ...req.body };
  upgrades.push(newUpg);
  res.status(201).json(newUpg);
});

app.put('/upgrades/:id', (req, res) => {
  const index = upgrades.findIndex(u => u.id === +req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Апгрейд не знайдено' });
  const error = validateUpgrade(req.body);
  if (error) return res.status(400).json({ message: error });
  upgrades[index] = { id: +req.params.id, ...req.body };
  res.json(upgrades[index]);
});

app.delete('/upgrades/:id', (req, res) => {
  const index = upgrades.findIndex(u => u.id === +req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Апгрейд не знайдено' });
  const deleted = upgrades.splice(index, 1);
  res.json({ message: 'Апгрейд видалено', deleted: deleted[0] });
});


app.post('/buy-upgrade', (req, res) => {
  const { upgradeId } = req.body;

  if (!currentUser) {
    return res.status(404).json({ message: 'Користувач не знайдений' });
  }

  const upgrade = upgrades.find(u => u.id === upgradeId);
  if (!upgrade) {
    return res.status(404).json({ message: 'Апгрейд не знайдено' });
  }

  if (currentUser.balance < upgrade.price) {
    return res.status(400).json({ message: 'Недостатньо коштів для покупки' });
  }

  currentUser.balance -= upgrade.price;

  switch (upgrade.type) {
    case 'multiplyClick':
      currentUser.coinsPerClick *= upgrade.value;
      break;
    case 'addClick':
      currentUser.coinsPerClick += upgrade.value;
      break;
    case 'multiplyPassive':
      currentUser.passiveIncomePerSecond *= upgrade.value;
      break;
    case 'addPassive':
      currentUser.passiveIncomePerSecond += upgrade.value;
      break;
    default:
      return res.status(409).json({ message: 'Невірний тип ефекту апгрейду' });
  }

  res.status(200).json({
    message: 'Апгрейд успішно куплено',
    balance: currentUser.balance,
    coinsPerClick: currentUser.coinsPerClick,
    passiveIncomePerSecond: currentUser.passiveIncomePerSecond
  });
});


app.listen(PORT, () => console.log(`🚀 Сервер працює на http://localhost:${PORT}`));


