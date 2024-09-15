import type { Request, Response } from "express"
import Project from "../models/Project"

export class ProjectController {

    static createProject = async (req: Request, res: Response) => {
        const project = new Project(req.body)
        try {
            await project.save()
            res.send('Proyecto creado')
        } catch (e) {
            console.log(e)
        }
    }

    static getAllProjects = async (req: Request, res: Response) => {
        try {
            const projects = await Project.find()
            res.json(projects)
        } catch (e) {
            console.log(e)
        }
    }

    static getProjectById = async (req: Request, res: Response) => {
        try {
            const project = await Project.findById(req.params.id)
            if (!project) {
                return res.status(404).json({ msg: 'Proyecto no encontrado' })
            }
            res.json(project)
        } catch (e) {
            console.log(e)
        }
    }

    static updateProject = async (req: Request, res: Response) => {
        const { id } = req.params
        try {
            const project = await Project.findByIdAndUpdate(id, req.body)
            if (!project) {
                return res.status(404).json({ msg: 'Proyecto no encontrado' })
            }
            await project.save()
            res.send('Proyecto actualizado')
        } catch (e) {
            console.log(e)
        }
    }

}