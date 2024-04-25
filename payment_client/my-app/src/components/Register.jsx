import React, { useState } from 'react';
import { Card, CardContent, TextField, Button, Typography, Container } from '@mui/material';


/*
* The Register component is responsible for handling the registration of new users.
* It incorporates form inputs for user details, an image upload button for profile pictures,
* and validation for inputs like email and password.
*/

// State initialization for user data, profile image, preview source, and validation flags

const Register = ({ onRegister }) => {
    const [userData, setUserData] = useState({});
    const [profileImage, setProfileImage] = useState(null);
    const [previewSrc, setPreviewSrc] = useState('');
    const [emailOK, setEmailError] = useState(true);
    const [passwordOK, setPasswordError] = useState(true);
    const [image, setImage] = useState(null)

    // Function to set email error flag

    const badEmail = () => {
        setEmailError(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        //reset error states
        setEmailError(true);
        setPasswordError(true);
        
        // Aggregate form data
        const formData = {
            first_name: e.target.first_name.value,
            phonenumber: e.target.phone_number.value,
            email: e.target.email.value,
            password: e.target.password.value,
        };

        //Check that all fields have information
        for (const [key, value] of Object.entries(formData)) {
            if (!value) {
                alert(`Please fill in your ${key.replace('_', ' ')}`);
                return;

            }
        }
        console.log(formData);

        fetch("http://localhost:4000/user/register",{
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(formData),
            mode: "cors"
        })

            .then(response => {
                if (response.status === 200) {// Callback function to signal successful registration
                    response.json()
                        .then(data => {
                            console.log(data);
                            onRegister(true);
                        })
                } else if (response.status === 403) {// Set email error flag if email is taken or incorrect
                    badEmail()
                } else {
                    //Implement
                }
            })

    }
    // Update local state with form changes
    const handleChange = (e) => {
        setUserData({...userData,[e.target.name]:e.target.value});
    }
    




    return (
        <Container maxWidth="sm">
            <Card data-testid="register-card">
                <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Register
                    <form onSubmit={handleSubmit} onChange={handleChange}>
                        {previewSrc && <img src={previewSrc} alt="Profile Preview" height="100" />}
                        <TextField
                            data-testid = "firstname-field"
                            label="First Name"
                            variant= "outlined"
                            fullWidth
                            margin="normal"
                            type="name"
                            name="first_name"
                            required

                        />
                        <TextField
                            data-testid = "lastname-field"
                            label="Phonenumber"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            type="phonenumber"
                            name="phone_number"
                            required
                        />

                        <TextField
                            id="email"
                            data-testid = "register-email-field"
                            label={emailOK ? "Email":"Error"}
                            variant=  "outlined"
                            fullWidth
                            margin="normal"
                            type="email"
                            name="email"
                            helperText={emailOK ? "":"Email taken or incorrect"}
                            error={!emailOK}
                            required
                        />
                        <TextField
                            id="password"
                            data-testid = "password-field"
                            label="Password"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            type="password"
                            name="password"
                            required
                        />

                        
                        <Button
                            data-testid = "create-user-button"
                            variant="contained"
                            color="primary"
                            type="submit" fullWidth>
                            Register
                        </Button>
                    </form>

                    </Typography>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Register;