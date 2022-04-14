const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Tasks = require('./models/task')
const app = express()
const port = process.env.PORT || 3000   
const userRouter = require('./routers/user') 
const taskRouter = require('./routers/task')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')

// app.use((req,res,next)=>{
//     if(req.method === 'GET'){
//         res.send('GET requests are disabled')
//     }else{
//         next()
//     }
// })

// app.use((req,res,next)=>{
//     res.status(503).send('Nah bro')
// })
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

const upload = multer({
    dest:'images',
    limit:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(doc|docx)$/)){
            return cb(new Error('Please upload a Word document'))
        }

        cb(undefined , true)
    }
})

app.post('/upload',upload.single('upload'),(req,res)=>{
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

app.listen(port,()=>{
    console.log('Server is up on port '+ port)
})


// const myFunction = async ()=>{
//    const token = jwt.sign({_id:'abc123'} , 'myauthentication',{expiresIn : '7 days'})
//    console.log(token)

//    const data = jwt.verify(token,'myauthentication')
//    console.log(data)
// }

// myFunction()



// const main = async ()=>{
    // const task = await Tasks.findById('62515765feb19a487fd29ae3')
    // await task.populate('owner')
    // console.log(task.owner)

//     const user = await User.findById('625156d5feb19a487fd29ad5')
//     await user.populate('tasks')
//     console.log(user.tasks)
// }

// main()