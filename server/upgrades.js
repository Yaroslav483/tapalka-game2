let upgrades = [];
let currentId = 1;

function validateUpgrade(data) {
  const { name, description, price } = data;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return 'Поле name не може бути порожнім';
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    return 'Поле description не може бути порожнім';
  }

  if (typeof price !== 'number' || price < 0) {
    return 'Поле price має бути числом більше або рівним 0';
  }

  return null;
}

function getAll() {
  return upgrades;
}

function getById(id) {
  return upgrades.find(u => u.id === id);
}

function create(data) {
  const error = validateUpgrade(data);
  if (error) return { error };

  const newUpgrade = { id: currentId++, ...data };
  upgrades.push(newUpgrade);
  return { upgrade: newUpgrade };
}

function update(id, data) {
  const index = upgrades.findIndex(u => u.id === id);
  if (index === -1) return { error: 'Апгрейд не знайдено' };

  const error = validateUpgrade(data);
  if (error) return { error };

  upgrades[index] = { id, ...data };
  return { upgrade: upgrades[index] };
}

function remove(id) {
  const index = upgrades.findIndex(u => u.id === id);
  if (index === -1) return { error: 'Апгрейд не знайдено' };

  const deleted = upgrades.splice(index, 1);
  return { deleted: deleted[0] };
}

module.exports = { getAll, getById, create, update, remove };
