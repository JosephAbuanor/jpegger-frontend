import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Button,
    IconButton,
    Tooltip,
    Dialog,
    DialogContent,
    CircularProgress,
    Alert,
    TextField,
    InputAdornment,
    Chip,
    Menu,
    MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import {apiBaseUrl} from "../api";

const UserImages = ({ auth }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const [sortBy, setSortBy] = useState('uploadDate');
    const [sortDirection, setSortDirection] = useState('desc');
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [viewImage, setViewImage] = useState(null);

    useEffect(() => {
        fetchAllImages();
    },[]);

    const fetchAllImages = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${apiBaseUrl}/images`, {
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
                thumbnailUrl: image.image,
                fullUrl: image.image,
                size: image.Size,
                uploadDate: image.CreatedAt,
                uploadedBy: auth.user?.profile.email || 'current.user@example.com',
                type: image.ContentType,
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


    const handleViewImage = (image) => {
        setViewImage(image);
        setViewDialogOpen(true);
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
                    onClick={fetchAllImages}
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
                    Blog Images
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
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}





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
            </Dialog>

        </Box>
    );
};

export default UserImages;