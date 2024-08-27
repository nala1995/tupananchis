const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
require('dotenv').config();
const path = require('path');

const app = express();
const stripe = Stripe(process.env.REACT_APP_STRIPE_SECRET_KEY_API);
const corsOptions = { origin: 'https://www.nalabusinesses.com', optionsSuccessStatus: 200, methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'Authorization']};

app.use(cors(corsOptions));
app.use(express.json());
//app.use(express.static(path.join(__dirname, 'build')));
//app.get('*', (req, res) => {
//  res.sendFile(path.join(__dirname, 'build', 'index.html'));
//});



app.post('/create-checkout-session', async (req, res) => {
    const { stripeProductId } = req.body;
    if (!stripeProductId) {
        return res.status(400).json({ error: 'Missing stripeProductId' });
      }
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: stripeProductId,
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'https://www.nalabusinesses.com/Success', 
            cancel_url: 'https://www.nalabusinesses.com/Fail', 
        });
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating Stripe checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/send-email', (req, res) => {
    const { email, selectedValue } = req.body;
  
    const mailOptions = {
      from: process.env.REACT_APP_EMAIL_USER,
      to: 'nalabusiness1995@gmail.com',
      subject: 'Solicitud de cotización',
      text: `Se ha recibido una solicitud de cotización con la siguiente información:\n\nEmail: ${email}\nValor seleccionado: ${selectedValue}`
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send(error.toString());
      }
      res.status(200).send('Correo enviado: ' + info.response);
    });
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  app.post('/create-wompi-checkout-session', (req, res) => {
    try {
      const { priceCOP, currencyCOP } = req.body;
      const prefix = 'sk8-';
      const uniqueReference = prefix + uuidv4();
      const integrityKey = process.env.REACT_APP_INTEGRITY_KEY; 
      const currency = currencyCOP || 'COP';
  
      const concatenatedString = `${uniqueReference}${priceCOP}${currency}${integrityKey}`;
      const hash = crypto.createHash('sha256').update(concatenatedString).digest('hex');
  
      res.json({
        reference: uniqueReference,
        signature: hash
      });
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

 

const PORT = process.env.REACT_APP_PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
