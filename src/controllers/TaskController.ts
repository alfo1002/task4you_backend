import type { Request, Response } from "express"
import Project from "../models/Project"
import Task from "../models/Task"

export class TaskController {
    static createTask = async (req: Request, res: Response) => {
        try {
            const task = new Task(req.body)
            task.project = req.project.id
            req.project.tasks.push(task.id)
            //await task.save()
            //await req.project.save()
            await Promise.allSettled([task.save(), req.project.save()])
            res.send('Tarea Creada Correctamente')
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    static getTasks = async (req: Request, res: Response) => {
        try {
            const tasks = await Task.find({ project: req.project.id }).populate('project')
            res.json(tasks)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    static getTaskById = async (req: Request, res: Response) => {
        try {
            const task = await Task.findById(req.params.taskId)
            if (!task) {
                return res.status(404).json({ message: 'Tarea no encontrada' })
            }
            if (task.project.toString() !== req.project.id) {
                return res.status(404).json({ message: 'Tarea no coincide con Proyecto' })
            }
            res.json(task)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    static updateTask = async (req: Request, res: Response) => {
        try {
            const task = await Task.findById(req.params.taskId)
            if (!task) {
                return res.status(404).json({ message: 'Tarea no encontrada' })
            }
            if (task.project.toString() !== req.project.id) {
                return res.status(404).json({ message: 'Tarea no coincide con Proyecto' })
            }
            await Task.findByIdAndUpdate(req.params.taskId, req.body)
            res.send('Tarea Actualizada Correctamente')
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
}