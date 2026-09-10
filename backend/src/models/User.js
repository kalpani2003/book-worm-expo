import mongoose from "mongoose";
import bcrypt from "bcryptjs";

//schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profileImage:{
      type: String,
      default:""  
    }
});

//hash password before savong it to the database
userSchema.pre("save", async function(){

    if(!this.isModified("password")) return;
    

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

});

//compare password function
userSchema.methods.comparePassword = async function(userPassword){
    return await bcrypt.compare(userPassword, this.password);

};

//models
const User = mongoose.model("User", userSchema);  //users

export default User;

