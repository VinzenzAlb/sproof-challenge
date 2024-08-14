import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import SignatureWizard from './SignatureWizard';
import { Button, Box, Typography, Container, Snackbar, Input } from '@mui/material';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function App() {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [showWizard, setShowWizard] = useState(false);
  const [signatureComplete, setSignatureComplete] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [customPdfFile, setCustomPdfFile] = useState(null);
  const apiUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api/' : 'https://sproof-challenge.onrender.com/api/';

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1); // Reset to first page when a new document is loaded
  }

  const handleSignatureComplete = async (signatureData) => {
    try {
      const response = await fetch(apiUrl + "sign", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signatureData),
      });

      const data = await response.json();

      if (response.ok) {
        setSignatureComplete(true);
        setShowWizard(false);
        setSnackbarMessage(data.message);
        setSnackbarOpen(true);
      } else {
        throw new Error(data.error || 'Failed to sign document');
      }
    } catch (error) {
      console.error('Error signing document:', error);
      setSnackbarMessage(error.message);
      setSnackbarOpen(true);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setCustomPdfFile(file);
      setSignatureComplete(false); // Reset signature status for new document
    } else {
      setSnackbarMessage('Please select a valid PDF file.');
      setSnackbarOpen(true);
    }
  };

  const resetToInitialPdf = () => {
    setCustomPdfFile(null);
    setSignatureComplete(false);
  };

  return (
    <Container maxWidth="md">
      <Box className="App" my={4}>
        <Typography variant="h4" gutterBottom>PDF Viewer and Signature</Typography>
        <Box mb={2}>
          <Input
            type="file"
            onChange={handleFileChange}
            inputProps={{ accept: 'application/pdf' }}
          />
          <Button onClick={resetToInitialPdf} disabled={!customPdfFile}>
            Reset to Initial PDF
          </Button>
        </Box>
        <Document
          file={customPdfFile || apiUrl + 'pdf'}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page pageNumber={pageNumber} width={600} />
        </Document>
        <Box my={2}>
          <Typography>
            Page {pageNumber} of {numPages}
          </Typography>
          <Button
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(pageNumber - 1)}
          >
            Previous
          </Button>
          <Button
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber(pageNumber + 1)}
          >
            Next
          </Button>
        </Box>
        {!signatureComplete && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowWizard(true)}
          >
            Sign Document
          </Button>
        )}
        {signatureComplete && (
          <Typography color="success.main">Document signed successfully!</Typography>
        )}
        <SignatureWizard
          open={showWizard}
          onClose={() => setShowWizard(false)}
          onSignatureComplete={handleSignatureComplete}
        />
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Box>
    </Container>
  );
}

export default App;