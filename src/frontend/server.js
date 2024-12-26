const express = require('express');
const path = require('path');
const app = express();

// Log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, path) => {
        if (path.endsWith('.gif')) {
            res.set('Content-Type', 'image/gif');
        }
    }
}));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../..'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.gif')) {
            res.set('Content-Type', 'image/gif');
        }
    }
}));

// Handle all routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Serving static files from:`);
    console.log(`- ${path.join(__dirname)}`);
    console.log(`- ${path.join(__dirname, '../..')}`);
}); 