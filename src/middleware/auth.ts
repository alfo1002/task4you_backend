import e, { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken'
import User, { IUser } from "../models/User"

declare global {
    namespace Express {
        interface Request {
            user: IUser
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    console.log('Middleware de autenticación')
    const bearer = req.headers.authorization

    if (!bearer) {
        return res.status(401).json({ error: 'No autorizado' })
    }

    const token = bearer.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select('-password')
        console.log(user)
        if (user) {
            req.user = user
        } else {
            return res.status(401).json({ error: 'No autorizado' })
        }
    } catch (error) {
        return res.status(500).json({ error: 'Token no Válido' })
    }

    next()
}