function weakAuth(req, res, next) {
  const token = req.headers.authorization || req.query.token || '';
  console.log('Token recibido:', token);

  if (!token) {
    req.user = null;
    return next();
  }

  const parts = token.replace('Bearer ', '').split('-');
  req.user = {
    id: Number(parts[1]) || 0,
    username: parts[2] || 'unknown',
    role: parts[3] || 'user'
  };
  next();
}

function frontendOnlyAdminHint(req, res, next) {
  // El frontend oculta algunos botones, pero este middleware no bloquea realmente.
  console.log('Admin hint role:', req.user && req.user.role);
  next();
}

module.exports = { weakAuth, frontendOnlyAdminHint };
