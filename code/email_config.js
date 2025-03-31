


const nodemail=require('nodemailer')

const transporter=nodemail.createTransport({
    service:"gmail",
    auth:{
        user:"nabahire octave@gmail.com",

        pass:"octave@#$"

    }
})



const sendmail=async (to,subject,text)=>{
    try{
        const info=await transporter.sendMail({
            from:"nabahireoctave@gmail.com",
            to,
            subject,
            text

        })
    }catch(err){
        console.log("error for sending email")
    }
   
}



module.exports=sendmail