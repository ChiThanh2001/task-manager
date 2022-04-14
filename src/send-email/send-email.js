const mailgun = require('mailgun-js');
const DOMAIN = 'sandboxc128ba76c8354726b6413b6204c6e193.mailgun.org';
const api_key = process.env.SEND_EMAIL_API_KEY
const mg = mailgun({apiKey: api_key, domain: DOMAIN});
const sendWelcomeEmail = (email,name)=>{
    const data = {
        from: 'My Application <was.bighero2001@gmail.com>',
        to: email,
        subject: 'Welcome to the app',
        text: `Hello ${name},Thanks for signing up my application!`
    };
    mg.messages().send(data, function (error, body) {
        console.log(body);
    });
}

const sendEmailDeleteAccount = (email,name)=>{
    const data = {
        from: 'My Application  <was.bighero2001@gmail.com>',
        to: email,
        subject: ' Why you delete your account?',
        text: `Hello ${name},Can you tell me the reason you delete your account?`
    };
    mg.messages().send(data, function (error, body) {
        console.log(body);
    });
}

module.exports = {
    sendWelcomeEmail,
    sendEmailDeleteAccount
}