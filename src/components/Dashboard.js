import React, {useState} from 'react';
import {
    Box,
    Tabs,
    Tab,
    Container,
    Typography,
    AppBar
} from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Upload from '@mui/icons-material/Upload';
import Person from '@mui/icons-material/Person';
import Delete from '@mui/icons-material/Delete';
import ImageUpload from "./ImageUpload";
import RecycleBin from "./RecycleBin";
import UserImages from "./UserImages";
import Blog from "./Blog";
import ImageEditor from './watermark';

const TabPanel = ({children, value, index, ...other}) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`task-tabpanel-${index}`}
        {...other}
    >
        {value === index && (
            <Box sx={{p: 3}}>
                {children}
            </Box>
        )}
    </div>
);

const Dashboard = ({auth}) => {
    const [tabValue, setTabValue] = useState(0);


    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    return (
        <Box sx={{flexGrow: 1}}>
            <AppBar position="static" color="default">
                <Container maxWidth="xl">
                    <Typography variant="h5" component="h1" sx={{py: 2}}>
                        Image Processing System
                    </Typography>

                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        textColor="primary"
                        indicatorColor="primary"
                    >

                        <Tab
                            icon={<Person/>}
                            iconPosition="start"
                            label="User Images"
                        />
                        <Tab
                            icon={<Upload/>}
                            iconPosition="start"
                            label="Upload image"
                        />
                        <Tab
                            icon={<Delete/>}
                            iconPosition="start"
                            label="Recycle Bin"
                        />
                        <Tab
                            icon={<ListAltIcon/>}
                            iconPosition="start"
                            label="Blog"
                        />
                        <Tab
                            icon={<ListAltIcon/>}
                            iconPosition="start"
                            label="Water"
                        />
                    </Tabs>
                </Container>
            </AppBar>

            <Container maxWidth="xl">
                <TabPanel value={tabValue} index={0}>
                    <UserImages auth={auth}/>
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <ImageUpload auth={auth}/>
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                    <RecycleBin auth={auth}/>
                </TabPanel>
                <TabPanel value={tabValue} index={3}>
                    <Blog auth={auth}/>
                </TabPanel>
                <TabPanel value={tabValue} index={4}>
                    <ImageEditor auth={auth}/>
                </TabPanel>
            </Container>
        </Box>
    );
};

export default Dashboard;