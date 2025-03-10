import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Card,
  CardMedia,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {apiBaseUrl} from "../api";
const ImageUpload = ({ auth }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = useRef(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0]; // Take only the first file
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]; // Take only the first file
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleFile = (file) => {
    // Check if it's an image file
    if (!file.type.startsWith('image/')) {
      setSnackbar({
        open: true,
        message: 'Only image files are allowed',
        severity: 'warning'
      });
      return;
    }
    // Check file size limit
    if (file.size > MAX_FILE_SIZE) {
      setSnackbar({
        open: true,
        message: 'File size must be 5MB or less',
        severity: 'error'
      });
      return;
    }

    // Create preview URL
    const fileWithPreview = {
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type,
      uploaded: false
    };

    // Clear previous image if there was one
    if (selectedImage && selectedImage.preview) {
      URL.revokeObjectURL(selectedImage.preview);
    }

    setSelectedImage(fileWithPreview);
  };

  const removeFile = () => {
    if (selectedImage && selectedImage.preview) {
      URL.revokeObjectURL(selectedImage.preview);
    }
    setSelectedImage(null);
  };

  const handleUpload = async () => {
    if (!selectedImage || selectedImage.uploaded) {
      setSnackbar({
        open: true,
        message: 'No new image to upload',
        severity: 'info'
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage.file);
      reader.onloadend = async () => {
        const base64Image = reader.result;

        // Create request payload
        const payload = {
          image: base64Image,
          userId: auth.user.profile.sub,
          userName: auth.user.profile.email,
          contentType: selectedImage.file.type,
          filename: selectedImage.file.name
        };

        // Send POST request to Lambda function
        const response = await fetch(`${apiBaseUrl}/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.user.access_token}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Error uploading image');
        }

        const result = await response.json();
        console.log('Upload result:', result);

        // Mark image as uploaded
        setSelectedImage(prev => ({
          ...prev,
          uploaded: true
        }));

        setSnackbar({
          open: true,
          message: 'Image uploaded successfully',
          severity: 'success'
        });
      };
    } catch (error) {
      console.error('Upload error:', error);
      setSnackbar({
        open: true,
        message: 'Error uploading image',
        severity: 'error'
      });
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };
  const handleReset = () => {
    removeFile();
    setUploadProgress(0);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
      <Box sx={{ py: 2 }}>

        {!selectedImage ? (
            <Paper
                sx={{
                  p: 3,
                  mb: 3,
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 200,
                  cursor: 'pointer',
                  backgroundColor: '#f8f8f8',
                  transition: 'border-color 0.3s',
                  '&:hover': {
                    borderColor: 'primary.main'
                  }
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
            >
              <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleFileSelect}
              />
              <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" align="center" gutterBottom>
                Drag and drop an image here or click to browse
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Supports JPG, PNG, GIF, and other image formats
              </Typography>
            </Paper>
        ) : (
            <Box sx={{ mb: 3 }}>
              <Card
                  sx={{
                    position: 'relative',
                    maxWidth: 500,
                    mx: 'auto',
                    border: selectedImage.uploaded ? '2px solid #4caf50' : '1px solid #e0e0e0'
                  }}
              >
                <CardMedia
                    component="img"
                    height="300"
                    image={selectedImage.preview}
                    alt={selectedImage.name}
                    sx={{ objectFit: 'contain' }}
                />
                <Box sx={{ p: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    {selectedImage.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(selectedImage.size / 1024).toFixed(1)} KB
                  </Typography>
                  {uploadProgress > 0 && (
                      <Box sx={{ mt: 1, position: 'relative', height: 8, bgcolor: 'grey.200', borderRadius: 1 }}>
                        <Box
                            sx={{
                              position: 'absolute',
                              height: '100%',
                              width: `${uploadProgress}%`,
                              bgcolor: selectedImage.uploaded ? 'success.main' : 'primary.main',
                              borderRadius: 1,
                              transition: 'width 0.3s ease-in-out'
                            }}
                        />
                      </Box>
                  )}
                </Box>
                <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                  {selectedImage.uploaded ? (
                      <CheckCircleIcon sx={{ color: 'success.main', bgcolor: 'white', borderRadius: '50%', fontSize: 28 }} />
                  ) : (
                      <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                          }}
                          sx={{
                            bgcolor: 'rgba(0,0,0,0.6)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                          }}
                      >
                        <DeleteIcon fontSize="small" sx={{ color: 'white' }} />
                      </IconButton>
                  )}
                </Box>
              </Card>
            </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          {selectedImage && !selectedImage.uploaded && (
              <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CloudUploadIcon />}
                  onClick={handleUpload}
                  disabled={uploading}
              >
                {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Image'}
              </Button>
          )}

          {selectedImage && (
              <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleReset}
                  disabled={uploading}
              >
                {selectedImage.uploaded ? 'Upload Another Image' : 'Cancel'}
              </Button>
          )}
        </Box>

        <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
              onClose={handleSnackbarClose}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
  );
};

export default ImageUpload;