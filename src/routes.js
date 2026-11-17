const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('./db');
const { verifyToken, requireRole, SECRET } = require('./middleware');

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password, roles } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email y password son obligatorios' });
    }
    const user = await User.create({ username, email, password: bcrypt.hashSync(password, 8) });
    const names = Array.isArray(roles) && roles.length ? roles : ['user'];
    const found = await Role.findAll({ where: { name: names } });
    await user.setRoles(found);
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (e) {
    res.status(400).json({ message: e.errors ? e.errors[0].message : e.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || !bcrypt.compareSync(password || '', user.password)) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: 86400 });
    const roles = (await user.getRoles()).map((r) => 'ROLE_' + r.name.toUpperCase());
    res.json({ id: user.id, username: user.username, email: user.email, roles, accessToken: token });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/test/all', (req, res) => res.send('Contenido público'));
router.get('/test/user', verifyToken, requireRole('user', 'moderator', 'admin'), (req, res) => res.send('Contenido de usuario'));
router.get('/test/mod', verifyToken, requireRole('moderator', 'admin'), (req, res) => res.send('Contenido de moderador'));
router.get('/test/admin', verifyToken, requireRole('admin'), (req, res) => res.send('Contenido de administrador'));

module.exports = router;