const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
const blogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
numViews:{
 type:Number,
 default:0
},
isLiked:{
type:Boolean,
default:false
},
isDisLiked:{
 type:Boolean,
 default:false
},
likes:[{
 type:mongoose.Schema.ObjectId,
 ref:"User"
}],
dislikes:[{
 type:mongoose.Schema.ObjectId,
 ref:"User"
}],
images:[{
 type:String,
}],
author:{
 type:String,
 default:"admin"
}
},{
 toJSON:{virtuals:true},
 toObject:{virtuals:true},
 timestamps:true
});

blogSchema.pre(/^find/,function(next){
 this.populate({path:"likes",select:'name photo'})
 this.populate({path:"dislikes",select:'name photo'})
 next()
})

//Export the model
module.exports = mongoose.model('Blog', blogSchema);