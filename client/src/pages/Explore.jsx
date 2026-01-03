import React, { useEffect, useState } from 'react';
import { 
  Grid, Card, CardContent, CardActions, Typography, Button, Chip, 
  Box, CircularProgress, Alert, Stack 
} from '@mui/material';
import { 
  TrendingUp, Language, Public, Work, Verified, Analytics 
} from '@mui/icons-material';
import axios from 'axios';

export default function Explore() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState({});

  useEffect(() => {
    loadTrending();
  }, []);

  async function loadTrending() {
    setLoading(true);
    try {
      const res = await axios.get('/api/news/trending');
      setItems(res.data || []);
    } catch (err) {
      console.error('Error loading trending:', err);
    } finally {
      setLoading(false);
    }
  }

  async function analyzeNews(newsItem) {
    setAnalyzing(prev => ({ ...prev, [newsItem.id]: true }));
    try {
      const res = await axios.post('/api/analyze/comprehensive', {
        text: newsItem.title,
        url: newsItem.url,
        title: newsItem.title
      });
      // Show result in a new window or modal
      const resultWindow = window.open('', '_blank');
      if (resultWindow) {
        resultWindow.document.write(`
          <html>
            <head>
              <title>Analysis Result - ${newsItem.title}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                h1 { color: #333; }
                .result { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
                .metric { margin: 10px 0; }
                .label { font-weight: bold; color: #666; }
              </style>
            </head>
            <body>
              <h1>Analysis Result</h1>
              <div class="result">
                <h2>${newsItem.title}</h2>
                <div class="metric"><span class="label">Authenticity:</span> ${res.data.authenticity?.result || 'N/A'}</div>
                <div class="metric"><span class="label">Confidence:</span> ${res.data.authenticity?.confidence || 0}%</div>
                <div class="metric"><span class="label">Language:</span> ${res.data.language?.detected || 'N/A'}</div>
                <div class="metric"><span class="label">Country:</span> ${res.data.country?.detected || 'N/A'}</div>
                <div class="metric"><span class="label">Industry:</span> ${res.data.industry?.category || 'N/A'}</div>
                <div class="metric"><span class="label">Sentiment:</span> ${res.data.sentiment?.label || 'N/A'}</div>
                <div class="metric"><span class="label">Credibility:</span> ${res.data.credibility?.score || 0}%</div>
              </div>
            </body>
          </html>
        `);
      }
    } catch (err) {
      alert('Error analyzing news: ' + (err.response?.data?.error || err.message));
    } finally {
      setAnalyzing(prev => ({ ...prev, [newsItem.id]: false }));
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 2, color: 'white' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TrendingUp sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Trending News Analysis
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Explore and analyze trending news with comprehensive AI-powered insights
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {items.map((n) => (
          <Grid item xs={12} md={6} lg={4} key={n.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <Chip 
                    size="small" 
                    label={n.category} 
                    color="primary"
                    icon={<Work />}
                  />
                  {n.source && (
                    <Chip 
                      size="small" 
                      label={n.source} 
                      variant="outlined"
                    />
                  )}
                </Stack>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, minHeight: 60 }}>
                  {n.title}
                </Typography>
                {n.url && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Source: {n.url}
                  </Typography>
                )}
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  size="small" 
                  variant="contained" 
                  fullWidth
                  onClick={() => analyzeNews(n)}
                  disabled={analyzing[n.id]}
                  startIcon={analyzing[n.id] ? <CircularProgress size={16} /> : <Analytics />}
                >
                  {analyzing[n.id] ? 'Analyzing...' : 'Analyze News'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {(!items.length && !loading) && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No trending news available at the moment.
        </Alert>
      )}
    </Box>
  );
}
