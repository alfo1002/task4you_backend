import type { Request, Response } from "express"
import User from "../models/User"

export class TeamMemberController {
    static findMemberByEmail = async (req: Request, res: Response) => {
        const { email } = req.body
        const user = await User.findOne({ email }).select('id email name')
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' })
        }
        res.json(user)
    }
}