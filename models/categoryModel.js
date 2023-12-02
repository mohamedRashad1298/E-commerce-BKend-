const mongoose = require('mongoose');
const slugify = require('slugify')

const categorySchema = new mongoose.Schema({
 title : {
  type:String,
  unique:true,
  required:[true,'category must have a name'],
  minLength:[2,'too short for a category name '],
  maxLength:[32,'too short for a category name ']
 } ,
slug:String,
 image: {
  type:String,
 default:''} ,
},{
 timestamps:true
})

categorySchema.pre('save',function(next){
 this.slug = slugify(this.name,{lower:true})
 next()
})

const Category = new mongoose.model('Category', categorySchema);

module.exports = Category;