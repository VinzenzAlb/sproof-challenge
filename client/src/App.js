import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import SignatureWizard from './SignatureWizard';
import { Button, Box, Typography, Container, Snackbar, Input, useMediaQuery, useTheme } from '@mui/material';

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
  const [pdfWidth, setPdfWidth] = useState(600);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const containerRef = useRef(null);

  const apiUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api/' : 'https://sproof-challenge.onrender.com/api/';

  useEffect(() => {
    const updatePdfWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setPdfWidth(Math.min(containerWidth - 32, 800));
      }
    };

    updatePdfWidth();
    window.addEventListener('resize', updatePdfWidth);
    return () => window.removeEventListener('resize', updatePdfWidth);
  }, []);

  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleSignatureComplete = async (signatureData) => {
    try {
      const response = await fetch(`${apiUrl}sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signatureData),
      });

      const data = await response.json();

      if (response.ok) {
        setSignatureComplete(true);
        setShowWizard(false);
        setSnackbarMessage(data.message);
      } else {
        throw new Error(data.error || 'Failed to sign document');
      }
    } catch (error) {
      console.error('Error signing document:', error);
      setSnackbarMessage(error.message);
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setCustomPdfFile(file);
      setSignatureComplete(false);
    } else {
      setSnackbarMessage('Please select a valid PDF file.');
      setSnackbarOpen(true);
    }
  };

  return (
    <Container maxWidth="md" ref={containerRef}>
      <Box className="App" my={4}>
        <Typography variant="h4" gutterBottom>PDF Viewer and Signature</Typography>
        <Box mb={2} display="flex" flexDirection={isMobile ? 'column' : 'row'} alignItems="center" gap={1}>
          <Input
            type="file"
            onChange={handleFileChange}
            inputProps={{ accept: 'application/pdf' }}
          />
          <Button onClick={() => setCustomPdfFile(null)} disabled={!customPdfFile} variant="outlined">
            Reset to Initial PDF
          </Button>
        </Box>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          mb={2}
          sx={{ 
            height: isMobile ? 'calc(100vh - 300px)' : 'calc(100vh - 250px)', 
            overflowY: 'auto' 
          }}
        >
          <Document
            file={customPdfFile || `${apiUrl}pdf`}
            onLoadSuccess={handleDocumentLoadSuccess}
          >
            <Page pageNumber={pageNumber} width={pdfWidth} />
          </Document>
        </Box>
        <Box my={2} display="flex" flexDirection={isMobile ? 'column' : 'row'} alignItems="center" justifyContent="space-between">
          <Typography>
            Page {pageNumber} of {numPages}
          </Typography>
          <Box>
            <Button
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(prev => prev - 1)}
            >
              Previous
            </Button>
            <Button
              disabled={pageNumber >= numPages}
              onClick={() => setPageNumber(prev => prev + 1)}
            >
              Next
            </Button>
          </Box>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowWizard(true)}
          fullWidth={isMobile}
          disabled={signatureComplete}
        >
          {signatureComplete ? 'Document Signed' : 'Sign Document'}
        </Button>
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