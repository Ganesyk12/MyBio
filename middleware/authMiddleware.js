import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT from cookies
 */
export const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        // If no token, redirect to login page
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add user info to request
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error);
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

/**
 * Middleware to redirect to dashboard if already logged in
 */
export const redirectIfAuthenticated = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            return res.redirect('/centralize');
        } catch (error) {
            res.clearCookie('token');
            next();
        }
    } else {
        next();
    }
};
