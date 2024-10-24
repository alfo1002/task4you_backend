import { Request, Response, NextFunction } from 'express'

export function hasAuthorization(req: Request, res: Response, next: NextFunction) {
    if (req.user.id.toString() !== req.project.manager.toString()) {
        return res.status(401).json({ msg: 'No autorizado' })
    }
    next()
}