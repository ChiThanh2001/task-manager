const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail,sendEmailDeleteAccount} = require('../send-email/send-email')

router.get('/users/me',auth,async (req,res)=>{
    res.send(req.user)
})

router.get('/users/:id/avatar',async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(400).send()
    }
})

const upload = multer({
    limit:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image'))
        }

        cb(undefined,true)
    }
})

router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250 , height:250}).png().toBuffer()
    req.user.avatar = req.file.buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error : error.message})
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user , token})
    } catch (e) {
        res.status(400).send('g')
    }
})

router.post('/users/logout',auth,async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })

        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth ,async (req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
        
    }catch(e){
        res.status(500).send()
    }
})

router.get('/users/:id',async (req,res)=>{
    const _id = req.params.id

    try{
        const user = await User.findById(_id)
        console.log(user)
        if(!user){
            return res.status(404).send('Not found this user')
        }
        res.send(user)
    }
    catch(e){
        res.status(500).send(e)
    }

    // User.findById(_id).then(user=>{
    //     if(!user){
    //         return res.status(404).send('Not found this id user')
    //     }

    //     res.status(200).send(user)
    // }).catch(e=>{
    //     res.status(500).send("Not found this id")
    // })
})

router.post('/users',async (req,res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken()
        res.send({user , token})
    }
    catch(e){
        res.status(500).send(e)
    }
    // user.save().then(()=>{
    //     res.status(201).send(user)
    // }).catch((e)=>{
    //     res.status(400).send(e)
    // })
})

router.patch('/users/me',auth,async (req,res)=>{
    const keyUpdate = Object.keys(req.body)
    const validUpdate = ['name','age','email','password']
    const isValidUpdate = keyUpdate.every( update=> validUpdate.includes(update) )
    
    if(!isValidUpdate){
        return res.status(400).send('Invalid update request')
    }

    try{     
        keyUpdate.forEach( update => req.user[update] = req.body[update] )
        await req.user.save()

        // const user = await User.findByIdAndUpdate(_id , contentUpdate , {new:true , runValidators: true})

        res.send(req.user)  
    }
   catch(e){
        res.status(400).send(e)
   }

})

router.delete('/users/me',auth,async (req,res)=>{
    try{
        await req.user.remove()
        sendEmailDeleteAccount(req.user.email,req.user.name)
        res.send(req.user)
    }
    catch(e){
        res.status(400).send(e)
    }
})

router.delete('/users/me/avatar',auth,async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

module.exports = router
