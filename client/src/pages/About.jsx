import React from 'react';
import { Typography, Stack, Paper, Grid, Card, CardContent, Box } from '@mui/material';
import { Analytics, Verified, Security, Speed, Language, TrendingUp } from '@mui/icons-material';

export default function About() {
  return (
    <Box>
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          About NewsVerify Pro
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 800 }}>
          A comprehensive AI-powered news analysis platform designed for professionals. 
          Built with advanced machine learning models to provide real-time, quantified analysis 
          of news content with industry classification, language detection, and credibility scoring.
        </Typography>
      </Paper>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Our Mission
              </Typography>
              <Typography variant="body2" color="text.secondary">
                To provide professionals and individuals with comprehensive, AI-powered tools 
                to verify news authenticity, understand content context, and make informed decisions 
                in an era of information overload.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Technology Stack
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Built with cutting-edge technologies including React, Node.js, Flask, 
                Transformers (HuggingFace), MongoDB, and advanced ML models for text classification, 
                sentiment analysis, and language detection.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          Key Features
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Analytics color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Comprehensive Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Industry, language, country, sentiment
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Verified color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  ML-Powered Detection
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Advanced AI models with confidence scores
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Security color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Community Verification
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Green/Red flag system across platforms
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Speed color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Real-Time Processing
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fast, efficient, instant results
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Language color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Multi-Language Support
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Automatic language detection
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TrendingUp color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Chrome Extension
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Analyze news directly from browser
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 4, mt: 4, background: '#f8f9fa' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          How It Works
        </Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>1. Input:</strong> Paste news text, upload media, or use the Chrome extension on any news article.
          </Typography>
          <Typography variant="body2">
            <strong>2. Analysis:</strong> Our ML models analyze authenticity, detect language, identify country origin, 
            classify industry category, analyze sentiment, and calculate credibility scores.
          </Typography>
          <Typography variant="body2">
            <strong>3. Results:</strong> Get comprehensive quantified analysis with confidence scores, risk indicators, 
            and community verification flags.
          </Typography>
          <Typography variant="body2">
            <strong>4. Verification:</strong> Community members can submit green (trusted) or red (flagged) flags 
            to build collective verification across platforms.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
