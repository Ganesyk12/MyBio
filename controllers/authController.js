import { prisma } from "../lib/prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthController {
    /**
     * Render Login Page
     */
    static async getLogin(req, res) {
        res.render('auth/login', {
            title: 'Login | Admin Panel',
            layout: false, // Use independent layout for login
            error: req.query.error || null,
            success: req.query.success || null
        });
    }

    /**
     * Handle Login Process
     */
    static async login(req, res) {
        const { username, password } = req.body;

        try {
            // Find user by username
            const user = await prisma.userLogin.findUnique({
                where: { UserName: username }
            });

            if (!user) {
                return res.redirect('/login?error=Invalid username or password');
            }

            // Check if account is active
            if (user.Status !== 'A') {
                return res.redirect('/login?error=Account is inactive');
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, user.Password);

            if (!isMatch) {
                return res.redirect('/login?error=Invalid username or password');
            }

            // Generate JWT
            const token = jwt.sign(
                { id: user.IdUserLogin, username: user.UserName },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRATION || '24h' }
            );

            // Set HttpOnly Cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            // Redirect to admin dashboard
            res.redirect('/centralize');
        } catch (error) {
            console.error('Login Error:', error);
            res.redirect('/login?error=Server error, please try again later');
        }
    }

    /**
     * Handle Logout Process
     */
    static async logout(req, res) {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.redirect('/login');
    }

    /**
     * Render Register Page
     */
    static async getRegister(req, res) {
        res.render('auth/register', {
            title: 'Register | Admin Panel',
            layout: false,
            error: req.query.error || null,
            success: req.query.success || null
        });
    }

    /**
     * Render Forgot Password Page
     */
    static async getForgotPassword(req, res) {
        res.render('auth/forgot', {
            title: 'Forgot Password | Admin Panel',
            layout: false,
            step: 1,
            username: req.query.username || '',
            error: req.query.error || null,
            success: req.query.success || null
        });
    }

    /**
     * Validate Username for Password Reset (Step 1)
     */
    static async forgotPassword(req, res) {
        const { username } = req.body;

        if (!username) {
            return res.redirect('/forgot-password?error=Username is required');
        }

        try {
            const user = await prisma.userLogin.findUnique({
                where: { UserName: username }
            });

            if (!user) {
                return res.redirect('/forgot-password?error=Username not found');
            }

            if (user.Status !== 'A') {
                return res.redirect('/forgot-password?error=Account is inactive');
            }

            // Username valid -> show reset password form (Step 2)
            res.render('auth/forgot', {
                title: 'Reset Password | Admin Panel',
                layout: false,
                step: 2,
                username,
                error: null,
                success: null
            });
        } catch (error) {
            console.error('Forgot Password Error:', error);
            res.redirect('/forgot-password?error=Server error, please try again later');
        }
    }

    /**
     * Reset Password with New Password (Step 2)
     */
    static async resetPassword(req, res) {
        const { username, password, confirmPassword } = req.body;

        try {
            if (!username || !password) {
                return res.redirect('/forgot-password?error=All fields are required');
            }

            if (password !== confirmPassword) {
                return res.redirect(`/forgot-password?error=Passwords do not match&username=${encodeURIComponent(username)}`);
            }

            if (password.length < 6) {
                return res.redirect(`/forgot-password?error=Password must be at least 6 characters&username=${encodeURIComponent(username)}`);
            }

            const user = await prisma.userLogin.findUnique({
                where: { UserName: username }
            });

            if (!user) {
                return res.redirect('/forgot-password?error=Username not found');
            }

            if (user.Status !== 'A') {
                return res.redirect('/forgot-password?error=Account is inactive');
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Update password
            await prisma.userLogin.update({
                where: { IdUserLogin: user.IdUserLogin },
                data: {
                    Password: hashedPassword,
                    ModifiedBy: username,
                    DateModified: new Date()
                }
            });

            res.redirect('/login?success=Password reset successful. Please login with your new password.');
        } catch (error) {
            console.error('Reset Password Error:', error);
            res.redirect('/forgot-password?error=Server error, please try again later');
        }
    }

    /**
     * Handle Registration Process
     */
    static async register(req, res) {
        const { username, password, confirmPassword } = req.body;

        try {
            // Basic validation
            if (password !== confirmPassword) {
                return res.redirect('/register?error=Passwords do not match');
            }

            // Check if user already exists
            const existingUser = await prisma.userLogin.findUnique({
                where: { UserName: username }
            });

            if (existingUser) {
                return res.redirect('/register?error=Username is already taken');
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user
            await prisma.userLogin.create({
                data: {
                    UserName: username,
                    Password: hashedPassword,
                    Status: 'A' // Active by default
                }
            });

            res.redirect('/login?success=Account created successfully. Please login.');
        } catch (error) {
            console.error('Registration Error:', error);
            res.redirect('/register?error=Server error, please try again later');
        }
    }
}
