import express from 'express';
import cors from 'cors';
import mjml2html from 'mjml';
import axios from 'axios';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 3000;
const corsOptions = {
  origin: 'http://localhost:4200', // Replace with your Angular frontend URL
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(bodyParser.json());
app.use(cors(corsOptions));

// Root endpoint - helpful for testing
app.get('/', (req, res) => {
  res.json({
    message: 'MJML to HTML Converter API',
    status: 'online',
    endpoints: {
      status: 'GET /status',
      convert: 'POST /convert',
      health: 'GET /health'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});


// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'Server is running',
    port: port,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Function to fetch MJML content from URL
async function fetchMJML(url) {
  try {
    if (typeof url !== 'string') {
      throw new Error('URL must be a string');
    }
    const response = await axios.get(url, {
      headers: {
        Accept: 'application/json, text/plain, */*',
        'User-Agent': 'MJML-Converter/1.0'
      },
      timeout: 10000  // 10 second timeout
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching MJML content:', error.message);
    throw new Error(`Failed to fetch MJML: ${error.message}`);
  }
}

// Function to convert MJML to HTML
function convertToHTML(mjmlContent) {
  try {
    const { html, errors } = mjml2html(mjmlContent, {
      validationLevel: 'soft'
    });

    if (errors && errors.length > 0) {
      console.warn('MJML conversion warnings:', errors);
    }

    return html;
  } catch (error) {
    console.error('Error converting MJML to HTML:', error.message);
    throw new Error(`Failed to convert MJML: ${error.message}`);
  }
}


// API endpoint to fetch MJML content from URL and convert it to HTML
app.post('/convert', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        error: 'URL is required',
        message: 'Please provide a URL in the request body'
      });
    }

    console.log(`Converting MJML from URL: ${url}`);

    const mjmlContent = await fetchMJML(url);
    const htmlContent = convertToHTML(mjmlContent);

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});
// 404 handler - must be after all routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
    availableEndpoints: ['GET /', 'GET /status', 'GET /health', 'POST /convert']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
