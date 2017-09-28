'use strict';

// Load Mailgun keys from environment
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN

const mailgun = require('mailgun-js')({
  apiKey: MAILGUN_API_KEY,
  domain: MAILGUN_DOMAIN
});

// Default e-mail parameters for testing
const FROM_ADDRESS    = '<postmaster@' + MAILGUN_DOMAIN + '>';
const SUBJECT_TEXT    = "Lambda Serverless Email Demo using Mailgun";
const MESSAGE_TEXT    = 'Sample email sent from Serverless Email Demo.';
const MESSAGE_HTML    = `
<html>
  <title>Serverless Email Demo</title>
  <body>
    <div>
      <h1>Serverless Email Demo</h1>
      <span>Sample email sent from Serverless Email Demo.</span>
    </div>
  </body>
</html>
`

module.exports.sendEmail = (event, context, callback) => {
  var toAddress = "";
  if (event.body) {
    try {
      toAddress = JSON.parse(event.body).to_address || "";
    }
    catch (e){}
  }

  if (toAddress !== "") {
    const emailData = {
      to: toAddress,
      from: JSON.parse(event.body).from_address || FROM_ADDRESS,
      subject: JSON.parse(event.body).subject_text || SUBJECT_TEXT,
      text: JSON.parse(event.body).message_text || MESSAGE_TEXT,
      html: JSON.parse(event.body).message_html || MESSAGE_HTML
    };

    console.log(emailData);
    // send email
    mailgun.messages().send(emailData, (error, body) => {
      if (error) {
        // log error response
        console.log(error);
        callback(error);
      } else {
        const response = {
          statusCode: 202,
          body: JSON.stringify({
            message: "Request to send email is successful.",
            input: body,
          }),
        };
        console.log(response);
        callback(null, response);
      }
    });
  } else {
    const err = {
      statusCode: 422,
      body: JSON.stringify({
        message: "Bad input data or missing email address.",
        input: event.body,
      }),
    };
    // log error response
    console.log(err);
    callback(null, err);
  }
};
