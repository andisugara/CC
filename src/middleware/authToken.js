const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

try {
  initializeApp();
} catch (error) {
  if (error.code !== 'app/duplicate-app') {
    console.error('Firebase admin initialization error:', error);
  }
}

const verifyToken = async (req, res, next) => {
    const header = req.headers;
    const Istoken = header && header.authorization && header.authorization.split(' ')[0] === 'Bearer';
  
    if (!Istoken) {
      return res.status(400).json({
        error: true,
        message: 'Cari token dulu',
      });
    }
  
    const token = header.authorization.split(' ')[1];
  
    try {
      const decoded = await getAuth().verifyIdToken(token);
      res.locals.uid = decoded.uid;
      res.locals.email = decoded.email;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(403).json({
        error: true,
        message: error.message,
      });
    }
  };

module.exports = { verifyToken };