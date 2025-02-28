import React, { useState, useEffect, useRef } from 'react';
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
    TextField,
    InputAdornment,
    Chip,
    Menu,
    MenuItem,
    Divider
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {apiBaseUrl} from "../api";

const UserImages = ({ auth }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const [sortBy, setSortBy] = useState('uploadDate');
    const [sortDirection, setSortDirection] = useState('desc');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareLinkLoading, setShareLinkLoading] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState(null);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [viewImage, setViewImage] = useState(null);
    const fetchCalled = useRef(false);

    useEffect(() => {
        if (!fetchCalled.current) {
            fetchUserImages();
            fetchCalled.current = true;
        }
    }, );

    const fetchUserImages = async () => {
        setLoading(true);
        setError(null);

        try {
            const userId = auth.user.profile.sub;
            const response = await fetch(`${apiBaseUrl}/user-images?userId=${userId}`, {
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

            setImages(images);
        } catch (err) {
            console.error('Error fetching user images:', err);
            setError('Failed to load your images. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (image) => {
        setCurrentImage(image);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setCurrentImage(null);
    };

    const handleConfirmDelete = async () => {
        if (!currentImage) return;
        console.log(currentImage)
        try {
            const response = await fetch(`${apiBaseUrl}/soft-delete-image`, {
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
                severity: 'success'
            });

            // Remove the deleted image from the list
            setImages(prev => prev.filter(img => img.id !== currentImage.id));
        } catch (err) {
            console.error('Error deleting image:', err);
            setSnackbar({
                open: true,
                message: 'Failed to delete image. Please try again later.',
                severity: 'error'
            });
        } finally {
            handleDialogClose();
        }
    };
    const handleShareClick = async (image) => {
        setCurrentImage(image);
        setShareDialogOpen(true);
        setShareLinkLoading(true);
        setLinkCopied(false);

        try {
            // This would be your actual share link API endpoint
            // const response = await fetch(`your-get-share-link-endpoint/${image.id}`, {
            //   method: 'POST',
            //   headers: {
            //     'Authorization': `Bearer ${auth.user?.access_token}`,
            //     'Content-Type': 'application/json'
            //   },
            //   body: JSON.stringify({ expiryDays: 7 }) // Optional expiry
            // });

            // if (!response.ok) {
            //   throw new Error('Failed to generate share link');
            // }

            // const data = await response.json();
            // const link = data.shareLink;

            // Simulate API response with a delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Generate a mock share link
            const mockLink = `https://your-image-service.com/share/${image.id}?token=abc123xyz789`;
            setShareLink(mockLink);
        } catch (err) {
            console.error('Error generating share link:', err);
            setSnackbar({
                open: true,
                message: 'Failed to generate share link. Please try again.',
                severity: 'error'
            });
            setShareDialogOpen(false);
        } finally {
            setShareLinkLoading(false);
        }
    };

    const handleShareDialogClose = () => {
        setShareDialogOpen(false);
        setCurrentImage(null);
        setShareLink('');
        setLinkCopied(false);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink)
            .then(() => {
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 3000);
            })
            .catch(err => {
                console.error('Failed to copy link:', err);
                setSnackbar({
                    open: true,
                    message: 'Failed to copy link to clipboard',
                    severity: 'error'
                });
            });
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

    const handleMoreMenuClick = (event, imageId) => {
        setMoreMenuAnchorEl(event.currentTarget);
        setSelectedImageId(imageId);
    };

    const handleMoreMenuClose = () => {
        setMoreMenuAnchorEl(null);
        setSelectedImageId(null);
    };

    const handleViewImage = (image) => {
        setViewImage(image);
        setViewDialogOpen(true);
        handleMoreMenuClose();
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
    const filteredImages = images.filter(image =>
        image.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (image.tags && image.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
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
        } else if (sortBy === 'uploadDate') {
            compareA = new Date(a.uploadDate).getTime();
            compareB = new Date(b.uploadDate).getTime();
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
                    Loading your images...
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
                    onClick={fetchUserImages}
                >
                    Try Again
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                    My Images
                </Typography>
                <Chip
                    label={`${images.length} image${images.length !== 1 ? 's' : ''}`}
                    color="primary"
                    variant="outlined"
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <TextField
                    placeholder="Search images by name or tag..."
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

                <Box>
                    <Tooltip title="Sort images">
                        <Button
                            startIcon={<SortIcon />}
                            onClick={handleSortClick}
                            variant="outlined"
                            size="small"
                        >
                            Sort by: {sortBy === 'uploadDate' ? 'Date' : sortBy === 'name' ? 'Name' : 'Size'}
                        </Button>
                    </Tooltip>

                    <Menu
                        anchorEl={sortAnchorEl}
                        open={Boolean(sortAnchorEl)}
                        onClose={handleSortClose}
                    >
                        <MenuItem onClick={() => handleSortSelect('uploadDate')}>
                            Date Uploaded {sortBy === 'uploadDate' && (sortDirection === 'asc' ? '↑' : '↓')}
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
                    <Box component="img" src="/api/placeholder/100/100" alt="No images" sx={{ mb: 2, opacity: 0.6 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No images found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchQuery ? 'Try a different search term' : 'Upload your first image to get started'}
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {sortedImages.map((image) => (
                        <Grid item xs={12} sm={6} md={4} key={image.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardMedia
                                    component="img"
                                    height="180"
                                    image={image.thumbnailUrl}
                                    alt={image.name}
                                    sx={{
                                        objectFit: 'cover',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleViewImage(image)}
                                />
                                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography variant="subtitle1" noWrap title={image.name} sx={{ width: '85%' }}>
                                            {image.name}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMoreMenuClick(e, image.id)}
                                            sx={{ mt: -1, mr: -1 }}
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {formatFileSize(image.size)} • {formatDate(image.uploadDate)}
                                    </Typography>
                                    {image.tags && image.tags.length > 0 && (
                                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {image.tags.map(tag => (
                                                <Chip
                                                    key={tag}
                                                    label={tag}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.7rem' }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </CardContent>
                                <Divider />
                                <CardActions>
                                    <Tooltip title="Get shareable link">
                                        <Button
                                            size="small"
                                            startIcon={<ShareIcon />}
                                            onClick={() => handleShareClick(image)}
                                        >
                                            Share
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Delete to recycle bin">
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleDeleteClick(image)}
                                        >
                                            Delete
                                        </Button>
                                    </Tooltip>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">
                    Delete Image
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        Are you sure you want to delete "{currentImage?.name}"?
                        The image will be moved to the Recycle Bin and can be restored later.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        autoFocus
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Share Link Dialog */}
            <Dialog
                open={shareDialogOpen}
                onClose={handleShareDialogClose}
                aria-labelledby="share-dialog-title"
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle id="share-dialog-title">
                    Share "{currentImage?.name}"
                </DialogTitle>
                <DialogContent>
                    {shareLinkLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={30} />
                            <Typography variant="body1" sx={{ ml: 2 }}>
                                Generating shareable link...
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Copy this link to share your image with anyone:
                                </Typography>
                                <TextField
                                    value={shareLink}
                                    fullWidth
                                    variant="outlined"
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={handleCopyLink}
                                                    color={linkCopied ? "success" : "default"}
                                                >
                                                    {linkCopied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                {linkCopied && (
                                    <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                                        Link copied to clipboard!
                                    </Typography>
                                )}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                • Anyone with this link can view the image
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                • The link will expire after 7 days
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleShareDialogClose}>
                        Close
                    </Button>
                    {!shareLinkLoading && (
                        <Button
                            onClick={handleCopyLink}
                            variant="contained"
                            startIcon={linkCopied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                            color={linkCopied ? "success" : "primary"}
                        >
                            {linkCopied ? "Copied!" : "Copy Link"}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* More Options Menu */}
            <Menu
                anchorEl={moreMenuAnchorEl}
                open={Boolean(moreMenuAnchorEl)}
                onClose={handleMoreMenuClose}
            >
                <MenuItem onClick={() => {
                    const image = images.find(img => img.id === selectedImageId);
                    if (image) handleViewImage(image);
                }}>
                    <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                    View Image
                </MenuItem>
                <MenuItem onClick={() => {
                    const image = images.find(img => img.id === selectedImageId);
                    if (image) handleShareClick(image);
                    handleMoreMenuClose();
                }}>
                    <ShareIcon fontSize="small" sx={{ mr: 1 }} />
                    Get Share Link
                </MenuItem>
                <MenuItem onClick={() => {
                    const image = images.find(img => img.id === selectedImageId);
                    if (image) handleDeleteClick(image);
                    handleMoreMenuClose();
                }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Delete to Recycle Bin
                </MenuItem>
            </Menu>

            {/* Image View Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="lg"
                fullWidth
            >
                <Box sx={{ position: 'relative' }}>
                    <IconButton
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.4)', color: 'white' }}
                        onClick={() => setViewDialogOpen(false)}
                    >
                        &times;
                    </IconButton>
                    <Box
                        component="img"
                        src={viewImage?.fullUrl}
                        alt={viewImage?.name}
                        sx={{
                            width: '100%',
                            maxHeight: '80vh',
                            objectFit: 'contain',
                            bgcolor: '#f5f5f5'
                        }}
                    />
                </Box>
                <DialogContent sx={{ pb: 1 }}>
                    <Typography variant="h6">{viewImage?.name}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            {viewImage?.dimensions} • {formatFileSize(viewImage?.size || 0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Uploaded: {formatDate(viewImage?.uploadDate || '')}
                        </Typography>
                    </Box>
                    {viewImage?.tags && viewImage.tags.length > 0 && (
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {viewImage.tags.map(tag => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        startIcon={<ShareIcon />}
                        onClick={() => {
                            setViewDialogOpen(false);
                            handleShareClick(viewImage);
                        }}
                    >
                        Share
                    </Button>
                    <Button
                        startIcon={<DeleteIcon />}
                        color="error"
                        onClick={() => {
                            setViewDialogOpen(false);
                            handleDeleteClick(viewImage);
                        }}
                    >
                        Delete
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

export default UserImages;