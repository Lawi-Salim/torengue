const jwt = require('jsonwebtoken');
const { Utilisateurs } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await Utilisateurs.findByPk(decoded.id_user, { attributes: { exclude: ['password'] } });

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Utilisateur non trouvé.' });
      }

      next();
    } catch (error) {
      console.error(`Erreur d'authentification: ${error.name}`);
      return res.status(401).json({ message: 'Non autorisé, le token a échoué.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, pas de token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Le rôle '${req.user ? req.user.role : 'invité'}' n'est pas autorisé à accéder à cette ressource.`,
      });
    }
    next();
  };
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Accès refusé. Rôle admin requis.' });
  }
};

module.exports = { protect, authorize, admin };