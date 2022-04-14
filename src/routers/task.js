const express = require('express')
const router = new express.Router()
const Tasks = require('../models/task')
const auth = require('../middleware/auth')
const Task = require('../models/task')
router.get('/tasks',auth,async (req,res)=>{
    const match = {}
    const sort = {}
    
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }   

    try{
        // const tasks = await Tasks.find({owner:req.user._id})
        await req.user.populate({
            path:'tasks',
            match,
            option:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.tasks)
    }
    catch(e){
        res.status(500).send(e)
    }   

    // Tasks.find({}).then(tasks=>{
    //     res.send(tasks)
    // }).catch(e=>{
    //     res.status(500).send()
    // })
})

router.get('/tasks/:id',auth,async (req,res)=>{
    const _id = req.params.id
    try{
        // const task = await Tasks.findById(_id)
        const task = await Tasks.findOne({_id , owner: req.user._id})

        if(!task){
            return res.status(404).send(`Not found this task`)
        }
        res.send(task)
    }
    catch(e){
        res.status(500).send(e)
    }
    // Tasks.findById(_id).then(task=>{
    //     if(!task){
    //         return res.status(404).send()
    //     }
    //     res.send(task)
    // }).catch(e=>{
    //     res.status(500).send('Not find the task')
    // })
})


router.post('/tasks',auth,async (req,res)=>{
    // const task = new Tasks(req.body)

    const task = new Tasks({
        ...req.body,
        owner: req.user._id
    })
    try{
        await task.save()
        res.send(task)
    }
    catch(e){
        res.status(500).send(e)
    }

    // task.save().then(()=>{
    //     res.status(201).send(task)
    // }).catch((e)=>{
    //     res.status(400).send(e)
    // })
})


router.patch('/tasks/:id',auth,async (req,res)=>{
    const _id = req.params.id
    const body = req.body
    console.log(body)
    const keyUpdate = Object.keys(body)
    const invalidTask = ['description' , 'completed']
    const isValid = keyUpdate.every(update => invalidTask.includes(update))

    if(!isValid){
        return res.status(400).send('Invalid update request')
    }

    try{
        const task = await Tasks.findOne({_id, owner:req.user._id})
        // const task = await Tasks.findByIdAndUpdate(_id , body , {new:true, runValidators:true})

        if(!task){
            return res.status(404).send('Nah man')
        }

        keyUpdate.forEach(update=> task[update] = body[update])
        await task.save()

        res.send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})


router.delete('/tasks/:task',auth ,async (req,res)=>{
    try{
        const task = await Tasks.findOneAndDelete({_id:req.params.task , owner:req.user._id})
        if(!task){
            return res.status(404).send('g')
        }

        res.send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})

module.exports = router