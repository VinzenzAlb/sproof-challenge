import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import SignatureWizard from './SignatureWizard';
import { Button, Box, Typography, Container, Snackbar, IconButton, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';

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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const [isServerAwake, setIsServerAwake] = useState(false);

  const containerRef = useRef(null);
  const pdfContainerRef = useRef(null);
  const apiUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api/' : 'https://sproof-challenge.onrender.com/api/';

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const updatePdfDimensions = () => {
      if (containerRef.current && pdfContainerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const pdfContainerHeight = pdfContainerRef.current.clientHeight;
        const aspectRatio = 1 / Math.sqrt(2);
        const maxWidth = pdfContainerHeight * aspectRatio;
        const width = Math.min(pdfContainerRef.current.clientWidth - 32, maxWidth);
        const height = width / aspectRatio;
        setPdfDimensions({ width, height });
      }
    };

    updatePdfDimensions();
    window.addEventListener('resize', updatePdfDimensions);
    return () => window.removeEventListener('resize', updatePdfDimensions);
  }, []);

  useEffect(() => {
    checkServerStatus();
  }, [apiUrl]);


  const checkServerStatus = async () => {
    try {
      const response = await fetch(`${apiUrl}status`, { method: 'GET' });
      if (response.ok) {
        setIsServerAwake(true);
      } else {
        throw new Error('Server is not responding');
      }
    } catch (error) {
      console.log('Server is not awake yet:', error);
      setIsServerAwake(false);
    }
  };

  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleSignatureComplete = async (signatureData) => {
    await checkServerStatus();
    if (!isServerAwake) {
      setSnackbarMessage('The server is waking up. Please wait a moment and try again.');
      setSnackbarOpen(true);
      return;
    }
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

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  const handleFitToWidth = () => setZoomLevel(1);

  const LoadingMessage = () => (
    <Typography variant="body2" color="text.secondary">
      {isServerAwake ? 'Loading PDF...' : 'Loading PDF... This may take a few minutes, as the server may be inactive and needs to wake up.'}
    </Typography>
  );

  return (
    <Container maxWidth="lg" ref={containerRef} sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>PDF Viewer and Signature</Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center" mb={2}
        flexWrap={{ xs: 'wrap', md: 'nowrap' }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="contained"
            component="label"
            size="small"
          >
            Choose File
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              accept="application/pdf"
            />
          </Button>
          <Typography variant="body2" color="text.secondary">
            {customPdfFile ? customPdfFile.name : 'No file chosen'}
          </Typography>
        </Box>
        <Button onClick={() => setCustomPdfFile(null)} disabled={!customPdfFile} variant="outlined" size="small">
          Reset to Example PDF
        </Button>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
        <Tooltip title="Zoom Out"><IconButton onClick={handleZoomOut}><ZoomOutIcon /></IconButton></Tooltip>
        <Tooltip title="Auto Fit"><IconButton onClick={handleFitToWidth}><FitScreenIcon /></IconButton></Tooltip>
        <Tooltip title="Zoom In"><IconButton onClick={handleZoomIn}><ZoomInIcon /></IconButton></Tooltip>
      </Box>
      <Box
        ref={pdfContainerRef}
        flexGrow={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Document
          file={customPdfFile || `${apiUrl}pdf`}
          onLoadSuccess={handleDocumentLoadSuccess}
          loading={<LoadingMessage />}
        >
          <Page
            pageNumber={pageNumber}
            width={pdfDimensions.width * zoomLevel}
            height={pdfDimensions.height * zoomLevel}
          />
        </Document>
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2">
          Page {pageNumber} of {numPages}
        </Typography>
        <Box>
          <Button size="small" disabled={pageNumber <= 1} onClick={() => setPageNumber(prev => prev - 1)}>Previous</Button>
          <Button size="small" disabled={pageNumber >= numPages} onClick={() => setPageNumber(prev => prev + 1)}>Next</Button>
        </Box>
      </Box>
      <Box display="flex" justifyContent="flex-start">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowWizard(true)}
          sx={{
            width: isMobile ? '100%' : 'auto',
            minWidth: isMobile ? 'auto' : '200px'
          }}
          disabled={signatureComplete}
        >
          {signatureComplete ? 'Document Signed' : 'Sign Document'}
        </Button>
      </Box>
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
    </Container>
  );
}

export default App;