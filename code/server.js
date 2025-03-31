const express = require("express");
const cors=require("cors")
const bodyparser=require("body-parser")
const dotenv=require("dotenv")
const bcrypt=require('bcrypt')
const mysql_server=require("mysql2")

const jwt=require("jsonwebtoken")

const app=express()
dotenv.config()
const port=process.env.PORT

app.use(cors())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))


const connect_to_db=mysql_server.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DATABASE


})

connect_to_db.connect((err)=>{
    if(err){
      throw err
    }
    else{
        console.log('database connected');

    }
})

app.post('/api/auth/signup',async (req,res)=>{
    try{
        let {username,email,password}=req.body;
    if(!username | !email | !password){
      return res.status(400).json({message:"bad request"})
    }
    else{
        const salt=await bcrypt.genSalt(10);
        const hashed_password=await bcrypt.hash(password,salt)
        const sel_user="INSERT INTO `users`(username,email,password) VALUES (?,?,?)";
        connect_to_db.query(sel_user,[username,email,hashed_password],(err)=>{
         if(err){
            return res.status(500).json({message:"server error"})
         }
         else{
            return res.status(201).json({message:"create "})
         }
        })
    }
    }catch (err){
        throw err
    }
    
})

// middle ware for  authentication

// const Authentication_middleware=(req,res,next)=>{
//     const authHeader=req.headers['authorization']
//     const token=authHeader &&authHeader.split('')[1]
//     if(!token){
//         return res.status(401).json({message:"not token provided"})

        
//     } 
//     jwt.verify(token, 'myscretkey',(err,user)=>{
//         if(err)return res.status(403).json({message:"for bidden"})
//             req.user=user;
//         next()
//     })
   


// }
const islogged=(req,res,next)=>{
    try{
        const authHeader=req.headers['authorization'];
        const token=authHeader&&authHeader.split('')[1]
         if(!token){
            return res.status(401).json({message:"your not Authorized"})
         }
         else{
            jwt.verify(token,process.env.JSON_WEBTOKEN_SECRECT,(err,user)=>{
                if(err)return res.status(403).json({message:"Access denied becouse  your not Authorized"})
                    req.user=user;
                next()
                
            })
    }
   
     }catch(err){
        throw err
     }
}
app.post('/api/auth/login',async(req,res)=>{
    var {username,password}=req.body
    if(!username|!password){
    return res.status(400).json({message:"invalid input data" })

    }
    else{
        const sel_user_crede="SELECT * FROM `users` WHERE username=?"
        connect_to_db.query(sel_user_crede,[username],async(err,result)=>{
            if(err)return res.status(500).json({message:"server error",error:err.message})
                if(result.length==0){
                    return res.status(401).json({message:'user not found'})

                }
                else{
                   
                    if(result.length>0){
                        const user=result[0]
                    const valid_data=await bcrypt.compare(password,user.password)
                        if(valid_data){
                            const token =jwt.sign({id:user.id,username:user.username},
                                process.env.JSON_WEBTOKEN_SECRECT,
                                {expiresIn:"1h"}
                            )
                            

                            return res.status(200).json({message:"your logggedin ..",token})
                        }
                        else{
                            return res.status(401).json({message:'user not found'})

                        }

                    }
                }

        })
    }

})

app.get('/api/users/data',(req,res)=>{
    try{
    const query="SELECT * FROM `users`"
    connect_to_db.query(query,(err,result)=>{
        if(err){
            return res.status(500).json({message:"server sending user",error:err})

        }
        else{
            return res.status(200).json(result)
        }

    })
      
    }catch (err){
        throw err
    }

})



app.delete('/delete/user/:id',(req,res)=>{
    const id=req.params.id;
    const del_query="DELETE FROM `users` WHERE id=?"
    connect_to_db.query(del_query,[id],(err,result)=>{
        if(err){
            return res.status(500).json({message:"failed to delete"})
        }
        else{
            return res.status(200).json({mesage:"user deleted"})
        }
    })
})
app.listen(port,()=>{
    console.log(`server running on port ${port}`)
})







//select user by id



app.get('/user/:id',(req,res)=>{
    const id=req.params.id
    const query="SELECT*FROM `users` WHERE id=?"
    connect_to_db.query(query,[id],(err,result)=>{
        if(err){
            return res.status(500).json({message:"server error for sending user"})
        }
        else{
            return res.status(200).json(result)
        }
    })
})  





app.put('/update/:id',(req,res)=>{

    try{
        const {username,email}=req.body;

        // null false undefined
        if(!username|| !email){
            return res.status(400).json({message:"you send bad request"})
        }
        else{
            const userid=req.params.id
            const query="UPDATE `users` SET `username`=?,`email`=? WHERE id=?"
            connect_to_db.query(query,[username,email,userid],(err)=>{
                if(err) return res.status(500).json({message:"update failed .. server error",errror:err})
                return res.status(200).json({message:"user updated"})
            }) 
        }
       
    }catch(err){
        throw err
    }
   
})