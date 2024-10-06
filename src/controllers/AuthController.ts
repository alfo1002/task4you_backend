import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import Token from '../models/Token';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmails';

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
}