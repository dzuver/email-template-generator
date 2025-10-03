import express from 'express';
import cors from 'cors';
import mjml2html from 'mjml';
import axios from 'axios';
import bodyParser from 'body-parser';
const app = express();
const port = 3000;
const corsOptions = {
  origin: 'http://localhost:4200', // Replace with your Angular frontend URL
  methods: ['GET', 'POST'],
};

app.use(bodyParser.json());
app.use(cors(corsOptions));


// Function to fetch MJML content from URL
async function fetchMJML(url) {
  try {
    if (typeof url !== 'string') {
    }
    const response = await axios.get(url, {
      method: 'get',
      headers: {
        Accept: 'application/json, text/plain, */*'
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching MJML content:', error);
    throw error;
  }
}

// Function to convert MJML to HTML
function convertToHTML(mjmlContent) {
  try {
    const {html} = mjml2html(mjmlContent);
    return html;
  } catch (error) {
    console.error('Error converting MJML to HTML:', error);
    throw error;
  }
}

// API endpoint to fetch MJML content from URL and convert it to HTML
app.post('/convert', async (req, res) => {
  try {
    const {url} = req.body;
    if (!url) {
      res.status(400).send('URL is required');
      return;
    }
    const mjmlContent = await fetchMJML(url);
    const htmlContent = convertToHTML(mjmlContent);
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.get('/status', (req, res) => {
  res.send('Server is running');
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
