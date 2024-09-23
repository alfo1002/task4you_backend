import type { Request, Response } from "express"
import Project from "../models/Project"

export class ProjectController {

    static createProject = async (req: Request, res: Response) => {
        const project = new Project(req.body)
        try {
            console.log("Ingresando a crear")
            await project.save()
            res.send('Proyecto creado')
        } catch (e) {
            res.status(500).json({ msg: e.message })
        }
    }

    static getAllProjects = async (req: Request, res: Response) => {
        try {
            const projects = await Project.find()
            res.json(projects)
        } catch (e) {
            res.status(500).json({ msg: e.message })
        }
    }

    static getProjectById = async (req: Request, res: Response) => {
        try {
            const project = await Project.findById(req.params.id).populate('tasks')
            if (!project) {
                return res.status(404).json({ msg: 'Proyecto no encontrado' })
            }
            res.json(project)
        } catch (e) {
            res.status(500).json({ msg: e.message })
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
            res.status(500).json({ msg: e.message })
        }
    }

    static deleteProject = async (req: Request, res: Response) => {
        const { id } = req.params
        try {
            const project = await Project.findById(id)
            if (!project) {
                return res.status(404).json({ msg: 'Proyecto no encontrado' })
            }
            await project.deleteOne()
            res.send('Proyecto eliminado')
        } catch (e) {
            res.status(500).json({ msg: e.message })
        }
    }

}