const jwt = require('jsonwebtoken');
const { Utilisateurs } = require('../models');

const protect = async (req, res, next) => {
  console.log('=== MIDDLEWARE PROTECT ===');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers.authorization ? 'Token présent' : 'Pas de token');
  
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extrait:', token ? 'OUI' : 'NON');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token décodé:', decoded ? 'OUI' : 'NON');
      console.log('User ID dans token:', decoded?.id_user);
      
      req.user = await Utilisateurs.findByPk(decoded.id_user, { attributes: { exclude: ['password'] } });
      console.log('Utilisateur trouvé:', req.user ? 'OUI' : 'NON');
      if (req.user) {
        console.log('User ID:', req.user.id_user);
        console.log('User Role:', req.user.role);
      }

      if (!req.user) {
        console.log('❌ Utilisateur non trouvé');
        return res.status(401).json({ success: false, message: 'Utilisateur non trouvé.' });
      }

      console.log('✅ Authentification réussie');
      next();
    } catch (error) {
      console.error(`❌ Erreur d'authentification: ${error.name}`);
      console.error('Stack trace:', error.stack);
      return res.status(401).json({ message: 'Non autorisé, le token a échoué.' });
    }
  }

  if (!token) {
    console.log('❌ Pas de token fourni');
    return res.status(401).json({ message: 'Non autorisé, pas de token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('=== MIDDLEWARE AUTHORIZE ===');
    console.log('Roles autorisés:', roles);
    console.log('User role:', req.user?.role);
    console.log('User autorisé:', req.user && roles.includes(req.user.role) ? 'OUI' : 'NON');
    
    if (!req.user || !roles.includes(req.user.role)) {
      console.log('❌ Accès refusé - Rôle non autorisé');
      return res.status(403).json({
        success: false,
        message: `Le rôle '${req.user ? req.user.role : 'invité'}' n'est pas autorisé à accéder à cette ressource.`,
      });
    }
    console.log('✅ Autorisation réussie');
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