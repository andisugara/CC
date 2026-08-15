const admin = require('firebase-admin');

if (admin.apps.length === 0) {
  admin.initializeApp();
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
      const decoded = await admin.auth().verifyIdToken(token);
      res.locals.uid = decoded.uid;
      res.locals.email = decoded.email;
      next();
    } catch (error) {
      return res.status(403).json({
        error: true,
        message: error.message,
      });
    }
  };

module.exports = { verifyToken };