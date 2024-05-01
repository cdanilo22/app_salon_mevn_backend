import express from 'express'
import dotenv from 'dotenv'
import colors from 'colors'
import cors from 'cors'
import {db} from './config/db.js'
import servicesRoutes from './routes/servicesRoutes.js'
import authRoutes from './routes/authRoutes.js'
import appointmentRoutes from './routes/appointmentRoutes.js'
import userRoutes from './routes/userRoutes.js'


//Variables de entorno
dotenv.config()

//Configurar la app
const app = express()

// Leer datos via body

app.use(express.json()) 

//conectar a 
db()

//Configurar CORS
console.log(process.argv[2]);
//Configurar Cors
const whitelist = [process.env.FRONTEND_URL]

if(process.argv[2] === '--postman'){
    whitelist.push(undefined)
}

const corsOptions = {
    origin: function(origin, callback){
        if(whitelist.includes(origin)){
            //Permite la conexion
            callback(null, true)
        } else{
            //No permitir la conexion
            callback(new Error('Error en CORS'))
        }
    }
}

app.use(cors(corsOptions))

//Definir una ruta

app.use('/api/services', servicesRoutes) 
app.use('/api/auth', authRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/users', userRoutes)

//Definir Puerto
const PORT = process.env.PORT || 4000

//Arrancar la aplicacion
app.listen(PORT, () => {
    console.log(colors.blue('El servidor se está ejecutando en el puerto: ', colors.yellow(PORT)));
})
