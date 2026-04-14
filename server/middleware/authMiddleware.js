const { auth } = require('../config/firebase');

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  console.log('Auth middleware - header:', header ? 'present' : 'missing');
  
  if (!header?.startsWith('Bearer ')) {
    console.log('Auth middleware - no bearer token');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const token = header.split('Bearer ')[1];
    console.log('Auth middleware - verifying token');
    const decoded = await auth.verifyIdToken(token);
    console.log('Auth middleware - decoded user:', decoded.uid);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware - error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};
