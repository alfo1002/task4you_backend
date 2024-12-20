import type { Request, Response } from "express"
import User from "../models/User"
import Project from "../models/Project"

export class TeamMemberController {
    static findMemberByEmail = async (req: Request, res: Response) => {
        const { email } = req.body
        const user = await User.findOne({ email }).select('id email name')
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' })
        }
        res.json(user)
    }

    static getProjectTeam = async (req: Request, res: Response) => {
        const project = await (await Project.findById(req.project.id)).populate({
            path: 'team',
            select: 'id name email'
        })
        res.json(project.team)
    }

    static addMemberById = async (req: Request, res: Response) => {
        const { id } = req.body
        const user = await User.findById(id).select('id')
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' })
        }

        if (req.project.team.some(team => team.toString() === user.id.toString())) {
            return res.status(400).json({ error: 'Usuario ya está en el equipo' })
        }

        req.project.team.push(user.id)
        await req.project.save()
        res.send('Usuario agregado al equipo')
    }

    static removeMemberById = async (req: Request, res: Response) => {
        const { userId } = req.params

        if (!req.project.team.some(team => team.toString() === userId)) {
            return res.status(404).json({ error: 'Usuario no encontrado en el equipo' })
        }

        req.project.team = req.project.team.filter(teamMember => teamMember.toString() !== userId)

        await req.project.save()

        res.send('Usuario eliminado del equipo')
    }

}