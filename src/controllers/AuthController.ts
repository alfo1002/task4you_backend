import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';

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
            await user.save()

            res.send('Cuenta Creada, revisa tu email para confirmarla')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }
}