import User from '../models/User.js'
import { sendEmailVerification, sendEmailPasswordReset } from '../emails/authEmailService.js'
import { generateJWT, uniqueId } from '../utils/index.js'

const register = async(req, res) => {
   if(Object.values(req.body).includes('')){
    const error = new Error('Todos los campos son obligatorios')
    return res.status(400).json({msg: error.message})
   }

   //EVITAR REGISTROS DUPLICADOS
const  {email, password, name} = req.body
const userExists = await User.findOne({email})

if(userExists) {
    const error = new Error ('Usuario ya registrado')
    return res.status(400).json({msg: error.message})
}

   //VALIDAR LA EXTENSIÓN DEL PASSWORD
   const MIN_PASSWORD_LENGTH = 8
   if(password.trim().length < MIN_PASSWORD_LENGTH){
    const error = new Error(`El password debe contener ${MIN_PASSWORD_LENGTH} caracteres`)
    return res.status(400).json({msg: error.message})
}
   try{
    const user = new User(req.body)
    const result = await user.save()

    const {name, email, token} = result
    sendEmailVerification({name, email, token})
    
        res.json({
        msg: 'El usuario se creo correctamente, revisa tu email'
    })
   }catch(error){
    console.log(error);
   }
}

const verifyAccount = async (req, res) => {
    //console.log(req.params.token);
    const {token} = req.params

    const user = await User.findOne({token})
    if(!user){
        const error = new Error('Hubo un errror, token no válido')
        return res.status(401).json({msg: error.message})

    }
    //Si el token es válido, confirmar la cuenta
    try{
        user.verified = true
        user.token = ''
        await user.save();
        res.json({msg: 'Usuario confirmado Correctamente'})
    } catch(error) {
        console.log(error);
    }


}

const login = async(req, res) => {
    const {email, password} = req.body
    //Revisar que el usuario exista
    const user = await User.findOne({email})
    if(!user) {
        const error = new Error('El Usuario no existe')
        return res.status(401).json({msg: error.message})

    }
    //Revisar si el usuario confirmó su cuenta

    if(!user.verified) {
        const error = new Error('Tu cuenta no ha sido confirmada aún')
        return res.status(401).json({msg: error.message})

    }
    //comprobar el password
    if(await user.checkPassword(password)){
        const token = generateJWT(user._id)
       
        res.json({
            token
        })
    } else {
        const error = new Error('El password es incorrecto')
        return res.status(401).json({msg: error.message})
    }
}

const forgotPassword = async (req, res) => {
    const {email} = req.body

    //Comprobar si existeel usuario
    const user = await User.findOne({email})
    if(!user){
        const error = new Error('El usuario no existe')
        return res.status(404).json({msg: error.message})
    }
        try{
            user.token = uniqueId()
            const result = await user.save()
           await sendEmailPasswordReset({
                name: result.name,
                email: result.email,
                token: result.token

            })
            res.json({
                msg: 'Hemos enviado un email con las instrucciones'
            })
        } catch(error){
            console.log(error);
        }
  
}


const user = async (req, res) => { 
    //console.log('desde user');
    const {user} = req
    res.json(
        user
    )
}

const verifyPasswordResetToken = async (req, res) => {
    //console.log('desde verifyPasswordResetToken');
      const {token} = req.params
  // devuelve el token console.log(token);
  const isValidToken = await User.findOne({token})

  if(!isValidToken){
    const error = new Error('Hubo un error, Token no válido')
    return res.status(400).json({msg: error.message})
  }
  res.json({msg: 'Token Válido '})
}
const updatePassword = async (req, res) => {
    const {token} = req.params
    // devuelve el token console.log(token);
    const user = await User.findOne({token})
  
    if(!user){
     const error = new Error('Hubo un error, Token no válido')
     return res.status(400).json({msg: error.message})
    }

    const {password} = req.body
    try{
        user.token = ''
        user.password = password
        await user.save()
        res.json({
            msg: 'Password modificado correctamente'
        })
    }catch(error){
        console.log(error);
    }
    //console.log(password);
}
const admin = async (req, res) => {
    // console.log(req.user);
    const {user} = req
    
    if(!user.admin){
        const error = new Error('Acción no válida')
        return res.status(403).json({msg: error.message})
    }
    console.log(user);
    res.json(
     user
    )
 }
export{
    register,
    verifyAccount,
    login,
    user,
    forgotPassword,
    verifyPasswordResetToken,
    updatePassword,
    admin
}