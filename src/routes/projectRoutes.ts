import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { validateProjectExists } from "../middleware/projects";

const router = Router();

router.post('/',
    body('projectName').notEmpty().withMessage('Campo Obligatorio').isLength({ min: 5 }).withMessage('Debe tener al menos 5 caracteres'),
    body('clientName').notEmpty().withMessage('Campo Obligatorio').isLength({ min: 5 }),
    body('description').notEmpty().withMessage('Campo Obligatorio').isLength({ min: 5 }),
    handleInputErrors,
    ProjectController.createProject)
router.get('/', ProjectController.getAllProjects)
router.get('/:id',
    param('id').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    ProjectController.getProjectById)
router.put('/:id',
    body('projectName').notEmpty().withMessage('Campo Obligatorio').isLength({ min: 5 }).withMessage('Debe tener al menos 5 caracteres'),
    body('clientName').notEmpty().withMessage('Campo Obligatorio').isLength({ min: 5 }),
    body('description').notEmpty().withMessage('Campo Obligatorio').isLength({ min: 5 }),
    handleInputErrors,
    ProjectController.updateProject)
router.delete('/:id',
    param('id').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    ProjectController.deleteProject)

/** Routes for tasks */
router.post('/:projectId/tasks',
    validateProjectExists,
    body('name').notEmpty().withMessage('Campo Obligatorio').isLength({ min: 5 }).withMessage('Debe tener al menos 5 caracteres'),
    body('description').notEmpty().withMessage('Campo Obligatorio').isLength({ min: 5 }).withMessage('Debe tener al menos 5 caracteres'),
    handleInputErrors,
    TaskController.createTask
)

router.get('/:projectId/tasks',
    validateProjectExists,
    TaskController.getTasks
)

router.get('/:projectId/tasks/:taskId',
    validateProjectExists,
    TaskController.getTaskById
)

export default router