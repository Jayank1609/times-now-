import React from 'react';
import { Typography, Box, Button, Stack, Grid, Card, CardContent, Chip } from '@mui/material';
import { keyframes } from '@emotion/react';
import { Link } from 'react-router-dom';
import { Analytics, Verified, Language, TrendingUp, Security, Speed } from '@mui/icons-material';
import TimesTicker from '../components/TimesTicker';

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0px); }
`;

export default function Home() {
  const heroStats = [
    { label: 'Global Newsrooms', value: '120+', detail: 'enterprise integrations' },
    { label: 'Signals / min', value: '18,400', detail: 'real-time authenticity checks' },
    { label: 'Analyst Accuracy', value: '98.2%', detail: 'verified by Times of India' }
  ];

  const trustPillars = [
    { title: 'Times Square Command', body: 'Live command-center visuals, sentiment radar, and instant escalations mirrored after Times of India editorial desks.' },
    { title: 'Neon Insights', body: 'Layered overlays highlight credibility, geopolitical impact, and cross-platform velocity in one professional snapshot.' },
    { title: 'Studio-Grade UX', body: 'Editorial typography, cinematic gradients, and tactile controls keep analysts focused while delivering stakeholder-ready visuals.' }
  ];

  const experienceHighlights = [
    { title: 'Signal Integrity', metric: '42k+', caption: 'sources continuously authenticated', color: '#4caf50' },
    { title: 'Narrative Velocity', metric: '1.6s', caption: 'average ML response time', color: '#03a9f4' },
    { title: 'Risk Escalations', metric: '350+', caption: 'alerts routed per news cycle', color: '#ff9800' }
  ];

  return (
    <Box>
      <Box sx={{
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 4, md: 8 },
        borderRadius: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        mb: 6,
        backgroundImage: 'radial-gradient(circle at top left, rgba(255,255,255,0.25), transparent 55%)'
      }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'url(data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"160\" viewBox=\"0 0 10 10\"><path fill=\"%232a2f45\" d=\"M0 0h10v10H0z\"/><path stroke=\"%23324363\" stroke-opacity=\"0.35\" d=\"M0 0h10M0 5h10M0 10h10M0 0v10M5 0v10M10 0v10\"/></svg>)', opacity: 0.2 }} />
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 800, position: 'relative', zIndex: 1 }}>
          Professional News Analysis Platform
        </Typography>
        <Typography variant="h5" sx={{ opacity: 0.95, maxWidth: 800, mb: 4, position: 'relative', zIndex: 1 }}>
          Real-time AI-powered analysis with industry classification, language detection, country origin, and quantified ML scores. Built for professionals.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
          <Button component={Link} to="/analyze" variant="contained" size="large" sx={{ px: 4, py: 1.5 }}>
            Start Analyzing
          </Button>
          <Button component={Link} to="/explore" variant="outlined" size="large" sx={{ px: 4, py: 1.5, borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
            Explore News
          </Button>
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mt: 4, position: 'relative', zIndex: 1 }}>
          {heroStats.map(item => (
            <Box key={item.label} sx={{ flex: 1, p: 2.5, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.25)' }}>
              <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1 }}>{item.label}</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{item.value}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>{item.detail}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box sx={{ mb: 5 }}>
        <TimesTicker />
      </Box>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {trustPillars.map((pillar) => (
          <Grid key={pillar.title} item xs={12} md={4}>
            <Card sx={{ height: '100%', background: 'linear-gradient(180deg, rgba(15,23,42,0.9), rgba(15,23,42,0.6))', color: 'white', border: '1px solid rgba(255,255,255,0.08)' }}>
              <CardContent>
                <Chip label="Editorial Grade" size="small" sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 600 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  {pillar.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                  {pillar.body}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Features Grid */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', p: 3, textAlign: 'center' }}>
            <Analytics color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Comprehensive Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Get detailed insights including industry category, language, country origin, sentiment, and credibility scores
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', p: 3, textAlign: 'center' }}>
            <Verified color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              ML-Powered Detection
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Advanced machine learning models analyze text and media with high accuracy and confidence scores
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', p: 3, textAlign: 'center' }}>
            <Speed color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Real-Time Processing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fast and efficient analysis with real-time results and instant feedback
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', p: 3, textAlign: 'center' }}>
            <Language color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Multi-Language Support
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Automatic language detection and analysis for multiple languages
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', p: 3, textAlign: 'center' }}>
            <TrendingUp color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Trending Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Analyze trending news and get comprehensive insights with community verification
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', p: 3, textAlign: 'center' }}>
            <Security color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Community Flags
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Green and red flag system with tracking across different platforms for community verification
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 6, p: 4, borderRadius: 3, backgroundColor: '#ffffff', boxShadow: '0 20px 60px rgba(15,23,42,0.08)' }}>
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Typography variant="overline" sx={{ letterSpacing: 2, color: 'primary.main' }}>
            Times Square Experience
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Built for newsroom precision, deployed for enterprise governance
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
            Monitor narratives, escalate risks, and brief leadership with visuals that feel at home on the biggest screen in Times Square.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {experienceHighlights.map(item => (
            <Grid key={item.title} item xs={12} md={4}>
              <Card sx={{ height: '100%', borderTop: `4px solid ${item.color}` }}>
                <CardContent>
                  <Typography variant="overline" sx={{ letterSpacing: 1, color: 'text.secondary' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: item.color, mt: 1 }}>
                    {item.metric}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {item.caption}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTA Section */}
      <Box sx={{
        mt: 6,
        p: 6,
        borderRadius: 2,
        background: 'linear-gradient(180deg, rgba(15,98,254,0.06), rgba(138,63,252,0.06))',
        border: '1px solid rgba(15,98,254,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        animation: `${float} 6s ease-in-out infinite`
      }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Ready to analyze news professionally?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
          Upload an image, paste text, or explore trending news to get comprehensive AI-powered analysis with quantified scores and detailed insights.
        </Typography>
        <Button component={Link} to="/analyze" variant="contained" size="large" sx={{ px: 4 }}>
          Get Started Now
        </Button>
      </Box>
    </Box>
  );
}
