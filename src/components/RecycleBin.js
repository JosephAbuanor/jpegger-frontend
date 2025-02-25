import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress,
    Alert,
    Snackbar,
    Divider,
    Chip
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import InfoIcon from '@mui/icons-material/Info';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, TextField, Menu, MenuItem } from '@mui/material';

const RecycleBin = ({ auth }) => {
    const [deletedImages, setDeletedImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [actionType, setActionType] = useState('');
    const [processing, setProcessing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [searchQuery, setSearchQuery] = useState('');
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const [sortBy, setSortBy] = useState('deletedDate');
    const [sortDirection, setSortDirection] = useState('desc');

    // Fetch deleted images on component mount
    useEffect(() => {
        fetchDeletedImages();
    }, []);

    const fetchDeletedImages = async () => {
        setLoading(true);
        setError(null);

        try {
            // This would be your actual API endpoint
            // const response = await fetch('your-deleted-images-endpoint', {
            //   headers: {
            //     'Authorization': `Bearer ${auth.user?.access_token}`
            //   }
            // });

            // if (!response.ok) {
            //   throw new Error('Failed to fetch deleted images');
            // }

            // const data = await response.json();

            // Simulate API response
            await new Promise(resolve => setTimeout(resolve, 1500));

            const mockData = [
                {
                    id: '1',
                    name: 'sunset_beach.jpg',
                    thumbnailUrl: '/api/placeholder/400/300',
                    fullUrl: '/api/placeholder/1200/900',
                    size: 1240000,
                    deletedDate: new Date(2025, 1, 20).toISOString(),
                    originalUploadDate: new Date(2025, 0, 15).toISOString(),
                    deletedBy: 'john.doe@example.com'
                },
                {
                    id: '2',
                    name: 'mountain_view.jpg',
                    thumbnailUrl: '/api/placeholder/400/300',
                    fullUrl: '/api/placeholder/1200/900',
                    size: 2430000,
                    deletedDate: new Date(2025, 1, 18).toISOString(),
                    originalUploadDate: new Date(2024, 11, 5).toISOString(),
                    deletedBy: 'jane.smith@example.com'
                },
                {
                    id: '3',
                    name: 'family_portrait.jpg',
                    thumbnailUrl: '/api/placeholder/400/300',
                    fullUrl: '/api/placeholder/1200/900',
                    size: 3560000,
                    deletedDate: new Date(2025, 1, 15).toISOString(),
                    originalUploadDate: new Date(2024, 10, 22).toISOString(),
                    deletedBy: 'john.doe@example.com'
                },
                {
                    id: '4',
                    name: 'company_logo.png',
                    thumbnailUrl: '/api/placeholder/400/300',
                    fullUrl: '/api/placeholder/1200/900',
                    size: 580000,
                    deletedDate: new Date(2025, 1, 10).toISOString(),
                    originalUploadDate: new Date(2024, 9, 30).toISOString(),
                    deletedBy: 'admin@example.com'
                },
                {
                    id: '5',
                    name: 'product_showcase.jpg',
                    thumbnailUrl: '/api/placeholder/400/300',
                    fullUrl: '/api/placeholder/1200/900',
                    size: 1820000,
                    deletedDate: new Date(2025, 1, 5).toISOString(),
                    originalUploadDate: new Date(2024, 8, 12).toISOString(),
                    deletedBy: 'marketing@example.com'
                }
            ];

            setDeletedImages(mockData);
        } catch (err) {
            console.error('Error fetching deleted images:', err);
            setError('Failed to load deleted images. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreClick = (image) => {
        setCurrentImage(image);
        setActionType('restore');
        setDialogOpen(true);
    };

    const handleDeleteForeverClick = (image) => {
        setCurrentImage(image);
        setActionType('delete');
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setCurrentImage(null);
        setActionType('');
    };

    const handleConfirmAction = async () => {
        if (!currentImage) return;

        setProcessing(true);

        try {
            if (actionType === 'restore') {
                // This would be your actual restore API endpoint
                // await fetch(`your-restore-image-endpoint/${currentImage.id}`, {
                //   method: 'POST',
                //   headers: {
                //     'Authorization': `Bearer ${auth.user?.access_token}`
                //   }
                // });

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                setSnackbar({
                    open: true,
                    message: `"${currentImage.name}" has been restored successfully`,
                    severity: 'success'
                });

                // Remove the restored image from the list
                setDeletedImages(prev => prev.filter(img => img.id !== currentImage.id));
            } else if (actionType === 'delete') {
                // This would be your actual permanent delete API endpoint
                // await fetch(`your-permanent-delete-endpoint/${currentImage.id}`, {
                //   method: 'DELETE',
                //   headers: {
                //     'Authorization': `Bearer ${auth.user?.access_token}`
                //   }
                // });

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                setSnackbar({
                    open: true,
                    message: `"${currentImage.name}" has been permanently deleted`,
                    severity: 'info'
                });

                // Remove the deleted image from the list
                setDeletedImages(prev => prev.filter(img => img.id !== currentImage.id));
            }
        } catch (err) {
            console.error(`Error ${actionType === 'restore' ? 'restoring' : 'deleting'} image:`, err);
            setSnackbar({
                open: true,
                message: `Failed to ${actionType === 'restore' ? 'restore' : 'permanently delete'} image. Please try again.`,
                severity: 'error'
            });
        } finally {
            setProcessing(false);
            handleDialogClose();
        }
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSortClick = (event) => {
        setSortAnchorEl(event.currentTarget);
    };

    const handleSortClose = () => {
        setSortAnchorEl(null);
    };

    const handleSortSelect = (field) => {
        if (sortBy === field) {
            // Toggle direction if same field
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // New field, default to descending
            setSortBy(field);
            setSortDirection('desc');
        }
        handleSortClose();
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
        else return (bytes / 1073741824).toFixed(1) + ' GB';
    };

    // Filter images based on search query
    const filteredImages = deletedImages.filter(image =>
        image.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort images based on selected criteria
    const sortedImages = [...filteredImages].sort((a, b) => {
        let compareA, compareB;

        if (sortBy === 'name') {
            compareA = a.name.toLowerCase();
            compareB = b.name.toLowerCase();
        } else if (sortBy === 'size') {
            compareA = a.size;
            compareB = b.size;
        } else if (sortBy === 'deletedDate') {
            compareA = new Date(a.deletedDate).getTime();
            compareB = new Date(b.deletedDate).getTime();
        } else if (sortBy === 'originalUploadDate') {
            compareA = new Date(a.originalUploadDate).getTime();
            compareB = new Date(b.originalUploadDate).getTime();
        }

        if (sortDirection === 'asc') {
            return compareA > compareB ? 1 : -1;
        } else {
            return compareA < compareB ? 1 : -1;
        }
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>
                    Loading deleted images...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ py: 2 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button
                    variant="contained"
                    onClick={fetchDeletedImages}
                >
                    Try Again
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 2 }}>


            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <TextField
                    placeholder="Search deleted images..."
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={handleSearch}
                    sx={{ width: '60%' }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <Chip
                    label={`${deletedImages.length} item${deletedImages.length !== 1 ? 's' : ''}`}
                    color="primary"
                    variant="outlined"
                />
                <Box>
                    <Tooltip title="Sort images">
                        <Button
                            startIcon={<SortIcon />}
                            onClick={handleSortClick}
                            variant="outlined"
                            size="small"
                        >
                            Sort by: {sortBy.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Button>
                    </Tooltip>

                    <Menu
                        anchorEl={sortAnchorEl}
                        open={Boolean(sortAnchorEl)}
                        onClose={handleSortClose}
                    >
                        <MenuItem onClick={() => handleSortSelect('deletedDate')}>
                            Date Deleted {sortBy === 'deletedDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </MenuItem>
                        <MenuItem onClick={() => handleSortSelect('originalUploadDate')}>
                            Date Uploaded {sortBy === 'originalUploadDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </MenuItem>
                        <MenuItem onClick={() => handleSortSelect('name')}>
                            File Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </MenuItem>
                        <MenuItem onClick={() => handleSortSelect('size')}>
                            File Size {sortBy === 'size' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>

            {sortedImages.length === 0 ? (
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 5,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 2
                }}>
                    <DeleteForeverIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No deleted images found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchQuery ? 'Try a different search term' : 'When you delete images, they will appear here'}
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {sortedImages.map((image) => (
                        <Grid item xs={12} sm={6} md={4} key={image.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={image.thumbnailUrl}
                                    alt={image.name}
                                    sx={{ objectFit: 'cover' }}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle1" noWrap title={image.name}>
                                        {image.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Size: {formatFileSize(image.size)}
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Deleted: {formatDate(image.deletedDate)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        By: {image.deletedBy}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Tooltip title="Restore image">
                                        <Button
                                            size="small"
                                            startIcon={<RestoreIcon />}
                                            onClick={() => handleRestoreClick(image)}
                                        >
                                            Restore
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Delete permanently">
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<DeleteForeverIcon />}
                                            onClick={() => handleDeleteForeverClick(image)}
                                        >
                                            Delete
                                        </Button>
                                    </Tooltip>
                                    <Box sx={{ ml: 'auto' }}>
                                        <Tooltip title="View details">
                                            <IconButton size="small">
                                                <InfoIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Confirmation Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {actionType === 'restore' ? 'Restore Image' : 'Permanently Delete Image'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {actionType === 'restore'
                            ? `Are you sure you want to restore "${currentImage?.name}"? The image will be moved back to your main library.`
                            : `Are you sure you want to permanently delete "${currentImage?.name}"? This action cannot be undone.`
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmAction}
                        color={actionType === 'restore' ? 'primary' : 'error'}
                        variant="contained"
                        autoFocus
                        disabled={processing}
                        startIcon={processing ? <CircularProgress size={20} /> : null}
                    >
                        {processing ? 'Processing...' : actionType === 'restore' ? 'Restore' : 'Delete Permanently'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification Snackbar */}
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

export default RecycleBin;