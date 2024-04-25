const express = require("express")
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');


const app = express()
app.use(express.json());
app.use(cors());
const PORT = 8000
const server = http.createServer(app);
let sockets = {};

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",  // Allow your client URL
    methods: ["GET", "POST"],         // Allowed request methods
    credentials: true
  }
});
//Create a webcosket to send real time requests to client
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('login', async (token) => {

    try {
      // Verify the token
      const decoded = await jwt.verify(token, process.env.SECRET);
      console.log('Decoded JWT:', decoded);
      sockets[decoded.id] = socket; //Add a connection between socket and user

    } catch (err) {
        console.log('Error verifying JWT', err);
        socket.disconnect();
    }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
      //remove client
      Object.keys(sockets).forEach(key => {
        if (sockets[key] === socket) {
            delete sockets[key];
        }
    });
    });
});


const port = process.env.PORT || 4000;
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});


const user = require("./routes/user")

// Define middleware to parse JSON data
app.use(express.json())
// Use routes
app.use("/user", user)


// Start the server

app.post('/confirm-payment', (req, res) => {
  let isResponseSent = false;
  const { phoneNumber, amount } = req.body;
  console.log(`Received request to confirm payment: User ID ${phoneNumber}, Amount $${amount}`);
  // Implement logic to handle payment confirmation here

  const userSocket = sockets[phoneNumber]
  if(!userSocket) {
    res.status(400).json({success: false, message: "User not online"})
    return
  }
  else {
    userSocket.emit('payment-request', {
      amount: amount})

    userSocket.once('payment-confirmed', async (response) => {
      console.log('Payment confirmed by:', phoneNumber);
      // You can now send the response back to the HTTP request indicating success
      //IMPLEMENT LOGIC HERE
      updateUserBalance(phoneNumber, amount).then((paymentOK) =>  {
        if (paymentOK) {
          console.log("paymentOK ",paymentOK)
          res.json({ success: true, message: "Payment confirmation received" });
  
        }
        else {
          res.status(400).json({ success: false, message: "Payment confirmation failed, insufficient funds" });
        }
      });
      isResponseSent = true;  
    })
  
    setTimeout(() => {
      if (!isResponseSent) {
        console.log('Payment confirmation timeout for:', phoneNumber);
        res.status(408).json({ success: false, message: "No response from user, payment confirmation timeout" });
        isResponseSent = true; // Set flag to true to prevent any future response attempt
      }
      userSocket.removeAllListeners('payment-confirmed'); // Clean up listener to prevent memory leaks
    }, 10000); // 10 seconds timeout
    
}});


async function updateUserBalance(userId, newBalance) {
  const url = `http://localhost:5000/users/${userId}/balance`;
  const data = { newBalance };

  try {
      const response = await fetch(url, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
              'Content-Type': 'application/json'
          }
      });

      if (!response.ok) {
          console.log(response)
          return false;
      }

      console.log('Update successful');
      return true
  } catch (error) {
      console.error('Error updating user balance:', error.message);
      return false;
  }
}



app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`)
})

