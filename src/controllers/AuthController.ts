import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import Token from '../models/Token';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmails';
import { generateJWT } from '../utils/jwt';
import { token } from 'morgan';

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body
            const user = new User(req.body)

            // Validar email existente
            const userExists = await User.findOne({ email })
            if (userExists) {
                return res.status(400).json({ error: 'El email ya está en uso' })
            }

            //Hash Password
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt)

            // Generar el Token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Enviar email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                token: token.token,
                name: user.name
            })

            await Promise.allSettled([user.save(), token.save()])

            res.send('Cuenta Creada, revisa tu email para confirmarla')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({ token })
            if (!tokenExists) {
                return res.status(400).json({ error: 'El token no es válido' })
            }

            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send('Cuenta confirmada')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })
            if (!user) {
                return res.status(404).json({ error: 'Credenciales inválidas' })
            }
            if (!user.confirmed) {
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()

                //enviar email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    token: token.token,
                    name: user.name
                })
                return res.status(401).json({ error: 'Cuenta no Confirmada, se envio nuevo token' })
            }

            // Comparar password
            const isCorrectPassword = await bcrypt.compare(password, user.password)
            if (!isCorrectPassword) {
                return res.status(404).json({ error: 'Credenciales inválidas' })
            }
            const token = generateJWT({ id: user.id })
            res.send(token)

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }


    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            // Usuario existe
            const user = await User.findOne({ email })
            if (!user) {
                return res.status(404).json({ error: 'El usuario no esta registrado' })
            }

            if (user.confirmed) {
                return res.status(403).json({ error: 'La cuenta ya esta confirmada' })
            }

            // Generar el Token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Enviar email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                token: token.token,
                name: user.name
            })

            //await Promise.allSettled([user.save(), token.save()])
            token.save()

            res.send('Se envió un nuevo token, revisa tu email para confirmarla')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            // Usuario existe
            const user = await User.findOne({ email })
            if (!user) {
                return res.status(404).json({ error: 'El usuario no esta registrado' })
            }

            // Generar el Token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            // Enviar email
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                token: token.token,
                name: user.name
            })

            res.send('Se envió un nuevo token, revisa tu email para instrucciones')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({ token })
            if (!tokenExists) {
                return res.status(400).json({ error: 'El token no es válido' })
            }

            res.send('Token Valido, puedes cambiar tu contraseña')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const tokenExists = await Token.findOne({ token })
            if (!tokenExists) {
                return res.status(400).json({ error: 'El token no es válido' })
            }

            const user = await User.findById(tokenExists.user)
            user.password = await bcrypt.hash(req.body.password, 10)

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            res.send('El Password se modifico correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static user = async (req: Request, res: Response) => {
        return res.json(req.user)
    }

}