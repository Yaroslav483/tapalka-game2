document.getElementById('togglePassword').addEventListener('click', () => {
  const passwordField = document.getElementById('password');
  passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
});


document.getElementById('signUpForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('http://localhost:3000/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.status === 201) {
      alert(data.message);
      window.location.href = 'sign-in.html';
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert('Помилка з’єднання з сервером');
    console.error(err);
  }
});
