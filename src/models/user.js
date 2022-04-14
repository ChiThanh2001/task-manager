const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Tasks = require('./task')
const userSchema = new mongoose.Schema({
    name:{
        type:String
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error('age is must to be greater than 0')
            }
        }
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password:{
        type:String,
        trim:true,
        required:true,
        validate(value){
            if(value.length<=6){
                throw new Error('Password must be at least 7 characters')
            }
            if(value.toLowerCase().includes('password')){
                throw new Error('Password must not contain password word')
            }
        }
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email:email})

    if(!user){
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }

    return user
}

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign( {_id : user._id.toString()} , process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token : token})
    await user.save()

    return token
}

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.pre('save',async function(next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password , 8)
    }    
    
    next()
})

userSchema.pre('remove', async function(next){
    const user = this
    await Tasks.deleteMany({owner:user._id})
    next()
})

const User = mongoose.model('User',userSchema)

module.exports = User
