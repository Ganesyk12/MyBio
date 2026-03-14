import { UserLoginModel } from "../models/userLoginModel.js";

export class AuthController {
    static async getRegister(req, res) {
        try {
            res.render('auth/register', {
                title: 'Sign Up | Flat Able',
                layout: 'layouts/auth',
                message: null
            });
        } catch (error) {
            console.error('Error rendering register page:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async postRegister(req, res) {
        try {
            const { UserName, Password, ConfirmPassword } = req.body;

            // Validation
            if (!UserName || !Password) {
                return res.status(400).render('auth/register', {
                    title: 'Sign Up | Flat Able',
                    layout: 'layouts/auth',
                    message: { type: 'error', text: 'Username and password are required' }
                });
            }

            if (Password !== ConfirmPassword) {
                return res.status(400).render('auth/register', {
                    title: 'Sign Up | Flat Able',
                    layout: 'layouts/auth',
                    message: { type: 'error', text: 'Passwords do not match' }
                });
            }

            if (Password.length < 6) {
                return res.status(400).render('auth/register', {
                    title: 'Sign Up | Flat Able',
                    layout: 'layouts/auth',
                    message: { type: 'error', text: 'Password must be at least 6 characters' }
                });
            }

            // Check if username already exists
            const existingUser = await UserLoginModel.adminGetUserByUsername(UserName);
            if (existingUser) {
                return res.status(400).render('auth/register', {
                    title: 'Sign Up | Flat Able',
                    layout: 'layouts/auth',
                    message: { type: 'error', text: 'Username already exists' }
                });
            }

            // Create user
            await UserLoginModel.adminCreateUser({
                UserName,
                Password,
                Status: 'A'
            }, 'SYSTEM');

            res.redirect('/auth/login?registered=true');
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getLogin(req, res) {
        try {
            const message = req.query.registered ? 
                { type: 'success', text: 'Registration successful! Please login.' } : 
                { type: 'info', text: null };

            res.render('auth/login', {
                title: 'Sign In | Flat Able',
                layout: 'layouts/auth',
                message: req.query.registered ? message : null
            });
        } catch (error) {
            console.error('Error rendering login page:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async postLogin(req, res) {
        try {
            const { UserName, Password } = req.body;

            if (!UserName || !Password) {
                return res.status(400).render('auth/login', {
                    title: 'Sign In | Flat Able',
                    layout: 'layouts/auth',
                    message: { type: 'error', text: 'Username and password are required' }
                });
            }

            const user = await UserLoginModel.authenticateUser(UserName, Password);

            if (!user) {
                return res.status(401).render('auth/login', {
                    title: 'Sign In | Flat Able',
                    layout: 'layouts/auth',
                    message: { type: 'error', text: 'Invalid username or password' }
                });
            }

            // Store user in session (you'll need to setup express-session)
            // req.session.user = user;

            res.redirect('/centralize');
        } catch (error) {
            console.error('Error logging in user:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async logout(req, res) {
        try {
            // Destroy session
            // req.session.destroy();
            res.redirect('/auth/login');
        } catch (error) {
            console.error('Error logging out:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}
