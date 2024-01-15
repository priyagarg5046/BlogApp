const nodemailer=require("nodemailer");
const sendEmail=async(email,subject,text)=>{
    try{
    const transporter = nodemailer.createTransport({
        // host: "smtp.forwardemail.net",
        // port: 465,
        // secure: true,
        service: "gmail",
        auth: {
          // TODO: replace `user` and `pass` values from <https://forwardemail.net>
          user: process.env.USER,
          pass: process.env.PASS,
        },
        authMethod:"PLAIN"
      });
      await transporter.sendMail({
        from:process.env.USER,
        to:email,
        subject:subject,
        text:text,
      })
      console.log("email sent");
    }catch(error){
        console.log("email not sent");
        console.log(error);
    }
}
module.exports=sendEmail;
