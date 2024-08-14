import React, { useState } from 'react';
import {
    Stepper, Step, StepLabel, Button, TextField,
    Typography, Box, Paper, Modal
} from '@mui/material';

const STEPS = ['Enter Name', 'Enter PIN', 'Review'];

const SignatureWizard = ({ open, onClose, onSignatureComplete }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const handleNext = (event) => {
        event.preventDefault();
        setError('');
        if (activeStep === 0 && !name) {
            setError('Please enter your name');
            return;
        }
        if (activeStep === 1 && !pin) {
            setError('Please enter the PIN');
            return;
        }
        if (activeStep === STEPS.length - 1) {
            onSignatureComplete({ name, pin });
        } else {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <TextField
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                );
            case 1:
                return (
                    <TextField
                        label="PIN"
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                );
            case 2:
                return (
                    <Typography>
                        Please confirm your details:<br />
                        Name: {name}<br />
                        PIN: ****
                    </Typography>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="signature-wizard-modal"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Paper elevation={3} style={{ padding: '20px', maxWidth: '500px', maxHeight: '80vh', overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>Sign Document</Typography>
                <Stepper activeStep={activeStep}>
                    {STEPS.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <form onSubmit={handleNext}>
                    <Box mt={2}>
                        {getStepContent(activeStep)}
                        {error && <Typography color="error">{error}</Typography>}
                    </Box>
                    <Box mt={2} display="flex" justifyContent="space-between">
                        <Button
                            type="button"
                            disabled={activeStep === 0}
                            onClick={() => setActiveStep((prev) => prev - 1)}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            {activeStep === STEPS.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Modal>
    );
};

export default SignatureWizard;