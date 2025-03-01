import React, {useState, useEffect, useRef} from 'react';
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
import {InputAdornment, TextField, Menu, MenuItem} from '@mui/material';
import {apiBaseUrl} from "../api";

const RecycleBin = ({auth}) => {
    const [deletedImages, setDeletedImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [actionType, setActionType] = useState('');
    const [processing, setProcessing] = useState(false);
    const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'});
    const [searchQuery, setSearchQuery] = useState('');
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const [sortBy, setSortBy] = useState('deletedDate');
    const [sortDirection, setSortDirection] = useState('desc');
    const fetchCalled = useRef(false);

    // Fetch deleted images on component mount
    useEffect(() => {
        if (!fetchCalled.current) {
            fetchDeletedImages();
            fetchCalled.current = true;
        }
    }, )

    const fetchDeletedImages = async () => {
        setLoading(true);
        setError(null);

        try {
            const userId = auth.user.profile.sub;
            const response = await fetch(`${apiBaseUrl}/deleted-images?userId=${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${auth.user?.access_token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user images');
            }

            const data = await response.json();

            // Map the API response to the existing state structure
            const images = data.images.map(image => ({
                id: image.ImageId,
                name: image.Filename,
                thumbnailUrl: image.imageUrl,
                fullUrl: image.imageUrl,
                size: image.Size,
                uploadDate: image.CreatedAt,
                uploadedBy: auth.user?.profile.email || 'current.user@example.com',
                type: image.ContentType,
                s3Key: image.S3Key,
                s3Bucket: image.S3Bucket,
                tags: [] // Assuming tags are not provided in the response
            }));

            setDeletedImages(images);
        } catch (err) {
            console.error('Error fetching deleted images:', err);
            setError('Failed to fetch your images. Please try again later.');
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
                const response = await fetch(`${apiBaseUrl}/restore-image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${auth.user?.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: auth.user.profile.sub,
                        imageId: currentImage.id,
                        s3Key: currentImage.s3Key // Assuming s3Key is part of the image object
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to restore image');
                }

                const data = await response.json();

                setSnackbar({
                    open: true,
                    message: data.message,
                    severity: 'success'
                });

                // Remove the deleted image from the list
                setDeletedImages(prev => prev.filter(img => img.id !== currentImage.id));
            } else if (actionType === 'delete') {
                const response = await fetch(`${apiBaseUrl}/delete-image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${auth.user?.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: auth.user.profile.sub,
                        imageId: currentImage.id,
                        s3Key: currentImage.s3Key // Assuming s3Key is part of the image object
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to delete image');
                }

                const data = await response.json();

                setSnackbar({
                    open: true,
                    message: data.message,
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
        setSnackbar({...snackbar, open: false});
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
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh'}}>
                <CircularProgress/>
                <Typography variant="h6" sx={{ml: 2}}>
                    Loading deleted images...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{py: 2}}>
                <Alert severity="error" sx={{mb: 2}}>
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
        <Box sx={{py: 2}}>


            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                <TextField
                    placeholder="Search deleted images..."
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={handleSearch}
                    sx={{width: '60%'}}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon/>
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
                            startIcon={<SortIcon/>}
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
                    <DeleteForeverIcon sx={{fontSize: 48, color: 'text.secondary', mb: 2}}/>
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
                            <Card sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={image.thumbnailUrl}
                                    alt={image.name}
                                    sx={{objectFit: 'cover'}}
                                />
                                <CardContent sx={{flexGrow: 1}}>
                                    <Typography variant="subtitle1" noWrap title={image.name}>
                                        {image.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Size: {formatFileSize(image.size)}
                                    </Typography>
                                    <Divider sx={{my: 1}}/>
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
                                            startIcon={<RestoreIcon/>}
                                            onClick={() => handleRestoreClick(image)}
                                        >
                                            Restore
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Delete permanently">
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<DeleteForeverIcon/>}
                                            onClick={() => handleDeleteForeverClick(image)}
                                        >
                                            Delete
                                        </Button>
                                    </Tooltip>
                                    <Box sx={{ml: 'auto'}}>
                                        <Tooltip title="View details">
                                            <IconButton size="small">
                                                <InfoIcon fontSize="small"/>
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
                        startIcon={processing ? <CircularProgress size={20}/> : null}
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
                anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    sx={{width: '100%'}}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default RecycleBin;