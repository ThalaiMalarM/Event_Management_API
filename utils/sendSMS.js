// utils/sendSMS.js
const { Vonage } = require('@vonage/server-sdk');

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

const sendSMS = async (toPhone, message) => {
  const from = 'EventSys'; // Sender name
  return new Promise((resolve, reject) => {
    vonage.sms.send({ to: toPhone, from, text: message }, (err, response) => {
      if (err) {
        console.error("SMS error:", err);
        reject(err);
      } else {
        console.log("SMS response:", response);
        resolve(response);
      }
    });
  });
};

module.exports = sendSMS;
