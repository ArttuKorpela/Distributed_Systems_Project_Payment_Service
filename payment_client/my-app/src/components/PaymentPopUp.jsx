import React, { useState } from 'react';
import { Modal, Box, Typography, Slider, Button } from '@mui/material';

function PaymentModal({ open, onClose, amount, setConfirmation }) {
  const [sliderValue, setSliderValue] = useState(0);



  const handleConfirm = () => {
    setConfirmation(true)
    onClose(); // Close the modal after confirming
    
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="payment-modal-title"
      aria-describedby="payment-modal-description"
    >
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
        <Typography id="payment-modal-title" variant="h6" component="h2" sx={{textAlign: 'center'}}>
          Confirm Payment
        </Typography>
        <Typography id="payment-modal-description" sx={{ mt: 2 , textAlign: 'center'}}>
          Amount: {amount.toFixed(2)} €
        </Typography>
        <Box textAlign={'center'}>
        <Button variant="contained" onClick={handleConfirm} >Confirm Payment</Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default PaymentModal;
