import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import SignatureWizard from './SignatureWizard';
import { Button, Box, Typography, Container } from '@mui/material';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function App() {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [showWizard, setShowWizard] = useState(false);
  const [signatureComplete, setSignatureComplete] = useState(false);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const handleSignatureComplete = (signatureData) => {
    console.log('Signature completed:', signatureData);
    setSignatureComplete(true);
    setShowWizard(false);
    // Here you would typically send the signature data to your server
  };

  return (
    <Container maxWidth="md">
      <Box className="App" my={4}>
        <Typography variant="h4" gutterBottom>PDF Viewer and Signature</Typography>
        <Document
          file="http://localhost:3001/api/pdf"
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
      </Box>
    </Container>
  );
}

export default App;