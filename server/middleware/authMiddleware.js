const jwt = require('jsonwebtoken');
const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    await sql.connect(dbConfig);
    const userResult = await new sql.Request()
      .input('userId', sql.Int, decoded.userId)
      .query('SELECT userId, username, role FROM Users WHERE userId = @userId');

    if (userResult.recordset.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found or deactivated' 
      });
    }

    // Add user info to request object
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Middleware to check user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

// Middleware for admin only routes
const requireAdmin = authorize('Admin');

// Middleware for client or admin routes
const requireUser = authorize('Admin', 'Client');

module.exports = {
  authenticateToken,
  authorize,
  requireAdmin,
  requireUser
};
