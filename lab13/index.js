const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const secretKey = 'tuClaveSecreta';
const verificationCodes = {};

const client = twilio('AC6758acb588edb66889f5ee0ff67a702a', '6bc2bbeecb9020fa67a80209d832f6be');

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'usuario' && password === 'contrasena') {
    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    verificationCodes[username] = verificationCode;

    // Cambia 'tuNumeroTwilio' con el número de teléfono real del usuario
    enviarCodigoPorSMS(username, '+51920602251', verificationCode);

    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ mensaje: 'Credenciales inválidas' });
  }
});

app.post('/verify', (req, res) => {
  const { username, code } = req.body;

  if (verificationCodes[username] && parseInt(code) === verificationCodes[username]) {
    res.json({ mensaje: 'Código verificado correctamente' });
  } else {
    res.status(401).json({ mensaje: 'Código inválido' });
  }
});

function enviarCodigoPorSMS(username, userPhoneNumber, code) {
  client.messages
    .create({
      body: `Tu código de verificación es: ${code}`,
      from: '+14157874409', // Reemplaza con tu número Twilio
      to: userPhoneNumber
    })
    .then(message => console.log('SMS enviado:', message.sid))
    .catch(error => console.error('Error al enviar SMS:', error));
}

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
