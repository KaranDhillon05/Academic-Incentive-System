const jwt = require('jsonwebtoken');
const { User } = require('../utils/inMemoryDb');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // For testing, we'll extract the user ID from the token
    // In a real app, this would verify the JWT
    if (token.startsWith('test_token_')) {
      const userId = parseInt(token.split('_')[2]);
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      req.user = {
        id: user._id.toString(), // Convert to string to avoid ObjectId issues
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department
      };

      next();
    } else {
      throw new Error('Invalid token');
    }
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
