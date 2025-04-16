// utils/sendSMS.js
const { Vonage } = require('@vonage/server-sdk');

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

const sendSMS = async (toPhone, message) => {
  const from = 'EventSys'; // Alphanumeric sender ID (can be set in Vonage Dashboard)

  return new Promise((resolve, reject) => {
    vonage.sms.send({ to: toPhone, from, text: message }, (err, response) => {
      if (err) {
        console.error("Vonage SMS Error:", err);
        reject(err);
      } else if (response.messages[0].status !== "0") {
        // 0 means success in Vonage
        console.error("Vonage SMS Failed:", response.messages[0]['error-text']);
        reject(new Error(response.messages[0]['error-text']));
      } else {
        console.log("Vonage SMS Success:", response);
        resolve(response);
      }
    });
  });
};

module.exports = sendSMS;
