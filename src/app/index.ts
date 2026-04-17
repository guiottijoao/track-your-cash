import express from 'express'
import { errorHandler } from './middleware/error-handler'
import userRoutes from './routes/users'

const app = express()

app.use(express.json())

app.use('/api/users', userRoutes)

app.use(errorHandler)

export default app