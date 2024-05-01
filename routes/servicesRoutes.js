import express from 'express'
import { createService, getServiceById, getServices, updateService, deleteService } from '../controllers/ServicesController.js'


const router = express.Router()


router.route('/')
    .post(createService)
    .get(getServices)


router.route('/:id')
    .get(getServiceById)
    .put(updateService)
    .delete(deleteService)

export default router     