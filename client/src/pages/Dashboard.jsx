import React, { useEffect, useState } from 'react';
import { 
  Typography, List, ListItem, ListItemText, Chip, Paper, Box, 
  Grid, Card, CardContent, CircularProgress, Stack, Divider 
} from '@mui/material';
import { 
  CheckCircle, Cancel, Language, Public, Work, SentimentSatisfied,
  TrendingUp, Analytics 
} from '@mui/icons-material';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    real: 0,
    fake: 0,
    byIndustry: {},
    byCountry: {},
    avgConfidence: 0
  });

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    try {
      const res = await axios.get('/api/history');
      const data = res.data || [];
      setItems(data);
      
      // Calculate statistics
      const total = data.length;
      const real = data.filter(it => {
        const result = it.authenticity?.result || it.result;
        return result === 'REAL' || result === 'authentic';
      }).length;
      const fake = total - real;
      
      const industries = {};
      const countries = {};
      let totalConfidence = 0;
      
      data.forEach(item => {
        if (item.industry?.category) {
          industries[item.industry.category] = (industries[item.industry.category] || 0) + 1;
        }
        if (item.country?.detected) {
          countries[item.country.detected] = (countries[item.country.detected] || 0) + 1;
        }
        totalConfidence += item.authenticity?.confidence || item.confidence || 0;
      });
      
      setStats({
        total,
        real,
        fake,
        byIndustry: industries,
        byCountry: countries,
        avgConfidence: total > 0 ? totalConfidence / total : 0
      });
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const chartData = {
    labels: items.slice(0, 10).map((_, i) => `#${i + 1}`),
    datasets: [{
      label: 'Confidence %',
      data: items.slice(0, 10).map(it => (it.authenticity?.confidence || it.confidence || 0).toFixed(1)),
      borderColor: '#0f62fe',
      backgroundColor: 'rgba(15,98,254,0.15)',
      tension: 0.4
    }]
  };

  const authenticityData = {
    labels: ['Real', 'Fake'],
    datasets: [{
      data: [stats.real, stats.fake],
      backgroundColor: ['#4caf50', '#f44336']
    }]
  };

  return (
    <Box>
      <Paper sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Analysis Dashboard
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Comprehensive overview of all your news analyses
        </Typography>
      </Paper>

      {/* Statistics Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Analytics color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Analyses
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {stats.real}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Real News
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Cancel color="error" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {stats.fake}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fake News
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <TrendingUp color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.avgConfidence.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Confidence
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Confidence Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={chartData} options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { min: 0, max: 100 } }
              }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Authenticity Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut data={authenticityData} options={{ 
                responsive: true, 
                maintainAspectRatio: false
              }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Analyses List */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          Recent Analyses
        </Typography>
        {items.length === 0 ? (
          <Typography color="text.secondary">No analyses yet. Start analyzing news!</Typography>
        ) : (
          <List>
            {items.map((it, idx) => {
              const result = it.authenticity?.result || it.result || 'UNKNOWN';
              const confidence = it.authenticity?.confidence || it.confidence || 0;
              const isReal = result === 'REAL' || result === 'authentic';
              
              return (
                <React.Fragment key={it._id || idx}>
                  <ListItem>
                    <Chip 
                      label={(it.type || 'unknown').toUpperCase()} 
                      color={it.type === 'media' ? 'secondary' : 'primary'} 
                      sx={{ mr: 2 }}
                      icon={it.type === 'media' ? <Analytics /> : <Language />}
                    />
                    <ListItemText 
                      primary={
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box>
                            {isReal ? (
                              <CheckCircle color="success" sx={{ fontSize: 20 }} />
                            ) : (
                              <Cancel color="error" sx={{ fontSize: 20 }} />
                            )}
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {result} ({confidence.toFixed(1)}%)
                          </Typography>
                        </Stack>
                      }
                      secondary={
                        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                          {it.industry?.category && (
                            <Chip size="small" label={it.industry.category} icon={<Work />} />
                          )}
                          {it.country?.detected && (
                            <Chip size="small" label={it.country.detected} icon={<Public />} />
                          )}
                          {it.sentiment?.label && (
                            <Chip size="small" label={it.sentiment.label} icon={<SentimentSatisfied />} />
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                            {new Date(it.createdAt).toLocaleString()}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItem>
                  {idx < items.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
}
