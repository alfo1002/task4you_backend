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

            const task = (await Task.findById(req.params.taskId).populate({ path: 'completedBy.user', select: 'id name email' }))
            console.log("task", task)
            if (!task) {
                console.log("tarea no encontrada")
                return res.status(404).json({ message: 'Tarea no encontrada' })
            }
            if (task.project.toString() !== req.project.id) {
                return res.status(404).json({ message: 'Tarea no coincide con Proyecto' })
            }
            res.json(task)
        } catch (error) {
            console.log("paul error")
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

    static deleteTask = async (req: Request, res: Response) => {
        try {
            const task = await Task.findById(req.params.taskId)
            if (!task) {
                return res.status(404).json({ message: 'Tarea no encontrada' })
            }
            if (task.project.toString() !== req.project.id) {
                return res.status(404).json({ message: 'Tarea no coincide con Proyecto' })
            }
            req.project.tasks = req.project.tasks.filter(taskId => taskId.toString() !== req.params.taskId)
            await Promise.allSettled([task.deleteOne(), req.project.save()])
            res.send('Tarea Eliminada Exitosamente')
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    static updateTaskStatus = async (req: Request, res: Response) => {
        try {
            const { taskId } = req.params
            const task = await Task.findById(taskId)
            if (!task) {
                return res.status(404).json({ message: 'Tarea no encontrada' })
            }

            if (task.project.toString() !== req.project.id) {
                return res.status(404).json({ message: 'Tarea no coincide con Proyecto' })
            }
            const { status } = req.body
            task.status = status
            /* if (status === 'completed') {
                task.completedBy = req.user.id
            } else {
                task.completedBy = null
            } */
            const data = {
                user: req.user.id,
                status
            }
            task.completedBy.push(data)
            await task.save()
            res.send('Estado de Tarea Actualizado Correctamente')
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

}