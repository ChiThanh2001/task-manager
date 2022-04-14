const mongoose = require('mongoose') 

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true
})



// const task = new Tasks({
//     description:"do homework",
//     completed:false
// })

// task.save().then(()=>{
//     console.log(task)
// }).catch((error)=>{
//     console.log(error)
// })  