import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import LoginAndRegister from './components/LoginAndRegister';
import PaymentModal from './components/PaymentPopUp';
import { Typography } from '@mui/material';

function App() {
  const [logStatus, setLogStatus] = useState(false);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [confirmation, setConfirmation] = useState(false);
  const [socket, setSocket] = useState(null);
  const [balance, setBalance] = useState(0);

  // Handle login status and socket connection
  useEffect(() => {
    if (logStatus) {
      const newSocket = io('http://localhost:4000');
      setSocket(newSocket);
      const token = localStorage.getItem("token");
      newSocket.emit('login', token);

      newSocket.on('payment-request', data => {
        paymentConfirmation(data.amount);
      });

      return () => newSocket.disconnect();
    }
  }, [logStatus]);

  // Handle payment confirmation
  useEffect(() => {
    if (confirmation && socket) {
      socket.emit('payment-confirmed', {
        message: 'Payment confirmed',
      });
      setConfirmation(false);
    }
  }, [confirmation, socket]);


  // Handle token validation and log status
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch('/tokenValid', {
        headers: {'Authorization': 'Bearer ' + token}
      })
      .then(response => {
        if (response.ok) {
          setLogStatus(true);
        } else {
          setLogStatus(false);
        }
      })
      .catch(e => {throw e});
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (logStatus && token) {
      setTimeout(() => {
        fetch('http://localhost:4000/user/balance', {
        headers: {
          'Authorization': 'Bearer ' + token        
      }})
        .then(response => response.json())
        .then(data => {
          setBalance(data.balance);
        });
      },200
      )
    }
  }, [confirmation]);

  //Function to trigger the popup
  const paymentConfirmation = (amount) => {
    setPaymentAmount(amount);
    setOpenPopUp(true);
  };

  //Function to close the popup
  const onClose = () => {
    setPaymentAmount(0);
    setOpenPopUp(false);
  };

  const updateBalanceShown = () => {

  }

  return (
    <div className="App">
      {logStatus ? (
        <>
          <Typography variant="h5" textAlign={"center"}>Balance: {balance} €</Typography>
          <PaymentModal
            open={openPopUp}
            amount={paymentAmount}
            setConfirmation={setConfirmation}
            onClose={onClose}
          />
        </>
      ) : (
        <LoginAndRegister/>
      )}
    </div>
  );
}

export default App;
