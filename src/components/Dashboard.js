import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Container,
  Typography,
  AppBar
} from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddTaskIcon from '@mui/icons-material/AddTask';
import PersonAdd from '@mui/icons-material/PersonAdd';


const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`task-tabpanel-${index}`}
    {...other}
  >
    {value === index && (
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    )}
  </div>
);

const Dashboard = ({auth}) => {
  const [tabValue, setTabValue] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (auth.user && auth.user.profile && auth.user.profile["cognito:groups"]) {
      setIsAdmin(auth.user.profile["cognito:groups"].includes("AdminGroup"));
    }

  }, [auth.user]);


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default">
        <Container maxWidth="xl">
          <Typography variant="h5" component="h1" sx={{ py: 2 }}>
            Task Management System
          </Typography>
          <code>
            <div>
              <pre> Hello: {auth.user?.profile.email} </pre>
              <pre> ID Token: {auth.user?.id_token} </pre>
              <pre> Access Token: {auth.user?.access_token} </pre>
              <pre> Refresh Token: {auth.user?.refresh_token} </pre>
              <pre> Admin: {isAdmin} </pre>

              <button onClick={() => auth.removeUser()}>Sign out</button>
            </div>
          </code>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab 
              icon={<ListAltIcon />} 
              iconPosition="start" 
              label="Task List" 
            />
            <Tab
              icon={<AddTaskIcon />}
              iconPosition="start"
              label="Create Task"
            />
            <Tab
                icon={<PersonAdd />}
                iconPosition="start"
                label="Create User"
            />
          </Tabs>
        </Container>
      </AppBar>

      <Container maxWidth="xl">
        <TabPanel value={tabValue} index={0}>
          Hi
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          Hello
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          Ciao
        </TabPanel>
      </Container>
    </Box>
  );
};

export default Dashboard;