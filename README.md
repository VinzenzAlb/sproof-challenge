# PDF Viewer with Pseudo-Signing

This project is a developer challenge for an internship application at Sproof, created by Vinzenz Alb, a Multimedia Technology student from FH Salzburg (5th semester).

## Overview

A React application with a Node.js backend that demonstrates PDF viewing and simulates document signing. The signing process is pseudo-implemented for demonstration purposes. Currently deployed at [https://sproof-challenge.vercel.app/](https://sproof-challenge.vercel.app/)

## Key Features

- PDF viewing with zoom and navigation
- Simulated document signing
- PDF upload functionality

## Tech Stack

- Frontend: React, Material-UI, react-pdf
- Backend: Node.js, Express

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```
   cd server && npm install
   cd ../client && npm install
   ```
3. Start the application:
   ```
   # In /server
   npm start
   # In /client
   npm start
   ```

Access the application at `http://localhost:3000`

## Note

This is a pseudo-implementation of document signing for demonstration purposes. It does not provide actual cryptographic signing functionality.

## Author

Vinzenz Alb
