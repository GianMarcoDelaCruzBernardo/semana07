const jwt = require('jsonwebtoken');
const { User } = require('./db');

const SECRET = process.env.JWT_SECRET || 'secreto-dev';

function verifyToken(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = req.headers['x-access-token'] || (header.startsWith('Bearer ') ? header.slice(7) : null);
  if (!token) return res.status(403).json({ message: 'No se envió el token' });
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token inválido o expirado' });
    req.userId = decoded.id;
    next();
  });
}

function requireRole(...allowed) {
  return async (req, res, next) => {
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    const roles = (await user.getRoles()).map((r) => r.name);
    if (roles.some((r) => allowed.includes(r))) return next();
    res.status(403).json({ message: `Requiere rol: ${allowed.join(' o ')}` });
  };
}

module.exports = { verifyToken, requireRole, SECRET };