const mongoose=require("mongoose");

mongoose.connect('mongodb+srv://shahzain:rvyevP5Bb7t92l78@cluster0.fogih1b.mongodb.net/abc?retryWrites=true&w=majority&appName=Cluster0/')
.then(() => console.log("MongoDB Connected Successfully"))
.catch(err => console.error(" MongoDB Connection Error:", err));



const admin=mongoose.Schema({
    name:String,
    email:String,
    password:String,
})

const Admin=mongoose.model("admin",admin);

const user=mongoose.Schema({
    name:String,
    email:String,
    password:String,
    purchasedCourses: [{
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'course'
        },
        purchaseDate: {
            type: Date,
            default: Date.now
        }
    }]
})

const User=mongoose.model("user",user);


const course=mongoose.Schema({
    name:String,
    price:String,
    description:String,
    imageurl:String,
})

const Course=mongoose.model("course",course);

module.exports={Admin,User,Course};
