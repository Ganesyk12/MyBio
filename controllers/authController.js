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
