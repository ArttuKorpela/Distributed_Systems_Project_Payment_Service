// Express
var express = require("express")
var router = express.Router()

// ValidateToken middleware
const ValidateToken = require("../auth/ValidateToken")

// Importing dotenv to use .env for secret key
require("dotenv").config()
const SECRET = process.env.SECRET

// Importing authentication tools
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")



/* POST routes */

// Register user
router.post("/register", async (req, res) => {
  // Get the name, email, password from the request body
  const { first_name, email, phonenumber,password } = req.body

  // If not all fields are entered respond back with false message
  if (!first_name || !phonenumber || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please enter all fields" })
  }

  // Check for existing users with same email
  const existingUser = await getUser(phonenumber)
  
  // If user is found respond back with false message
  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists" })
  }

  // If no existing user already create a new user
  else {
    // Using bcrypt to hash the password
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.password, salt, async (err, hash) => {
        if (err) throw err // If error occurs respond back with false message

        // Create new user to the database
        response = await addUser(phonenumber,email,first_name, hash)
        if (response) {
          // If user is created respond with success message
          res.status(200).json({ success: true, message: "User registered successfully" })
        } else {
          // If user is not created respond with failure message
          res.status(400).json({ success: false, message: "User registration failed" })
        }
      })
    })

  }
})

// Login user
router.post('/login', (req, res) => {
  const { phonenumber, password } = req.body;
  getUser(phonenumber).then(user => {
      if (!user) {
          return res.status(400).json({ success: false, message: "User not found" });
      }

      bcrypt.compare(password, user.Password, (err, isMatch) => {
          if (err) {
              return res.status(500).json({ success: false, message: "Error checking password" });
          }
          if (isMatch) {
              const token = jwt.sign({ id: user.ID, email: user.Email }, SECRET, { expiresIn: "1h" });
              return res.status(200).json({
                  success: true,
                  message: "Login successful",
                  token: token,
              });
          } else {
              return res.status(400).json({ success: false, message: "Wrong credentials" });
          }
      });
  }).catch(error => {
      console.error('Error during user retrieval:', error);
      res.status(500).json({ success: false, message: "Internal server error" });
  });
});

// Validate token
router.post("/tokenValid", ValidateToken, async (req, res) => {
  return res
    .status(200)
    .json({ success: true, id: req.user, message: "Token is valid" })
})

// Get user balance
router.get('/balance', ValidateToken, async (req, res) => {
  try {
    // Extract user data from JWT payload
    data = extractDataFromJWTPayload(req);
    //Get the user from the database using the id from the JWT payload
    const user = await getUser(data.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    } else {
      res.status(200).json({
        success: true,
        balance: user.Balance,
        message: "User balance retrieved successfully"
      });
    }
  } catch (errror) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }

})

const getUser = async (phoneNumber) => {
  const url = `http://localhost:5000/users/${phoneNumber}`;

  try {
      const response = await fetch(url); 

      if (!response.ok) {
          //No user
          return null;
      }

      const user = await response.json(); // Parse JSON data from the response and wait for it
      console.log('User retrieved:', user); // Log the user data
      return user; // Return the user data for further processing
  } catch (error) {
      console.error('Error fetching user:', error); 
      throw error; 
  }
}

const addUser = async (phonenumber, email, name, hashed_password) => {
  const url = "http://localhost:5000/users";
  const body = {
    id: phonenumber,
    username: name,
    email: email,
    password: hashed_password
  }
  console.log(body)
  const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
  });

  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
}
const extractDataFromJWTPayload = (req) => {
  const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7, authHeader.length); // Remove "Bearer " from the start

        try {
            // Verify and decode the token
            const decoded = jwt.verify(token, SECRET);
            
            return decoded;
            
        } catch (error) {
            // Handle errors, e.g., token is invalid or expired
            return res.status(403).json({ message: 'Invalid token' });
        }
      }else {
      return res.status(403).json({ message: 'No token provided' });
    }
}
  





// Export router
  module.exports = router;
