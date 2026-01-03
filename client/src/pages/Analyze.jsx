import React, { useState } from 'react';
import { 
  Stack, TextField, Button, Typography, Paper, Box, LinearProgress, 
  Grid, Chip, Card, CardContent, Alert, Divider, CircularProgress 
} from '@mui/material';
import { 
  CheckCircle, Cancel, Language, Public, Work, SentimentSatisfied,
  TrendingUp, Warning, Verified, Flag, Analytics
} from '@mui/icons-material';
import axios from 'axios';

export default function Analyze() {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);

  async function analyzeText() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post('/api/analyze/comprehensive', { text });
      setResult({ ...res.data, analysisId: res.data.id });
    } catch (err) {
      setError(err.response?.data?.error || 'Error analyzing text');
    } finally {
      setLoading(false);
    }
  }

  async function analyzeMedia() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await axios.post('/api/analyze/media', form);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error analyzing media');
    } finally {
      setLoading(false);
    }
  }

  async function submitFlag(flag) {
    if (!result?.analysisId) return;
    try {
      await axios.post(`/api/flags/${result.analysisId}`, { 
        flag, 
        platform: 'web' 
      });
      // Update local state
      setResult(prev => ({
        ...prev,
        userFlags: {
          ...prev.userFlags,
          [flag]: (prev.userFlags?.[flag] || 0) + 1
        }
      }));
    } catch (err) {
      console.error('Error submitting flag:', err);
    }
  }

  const getAuthenticityColor = (result) => {
    if (!result) return 'default';
    const auth = result?.authenticity?.result || result?.result;
    if (auth === 'REAL' || auth === 'authentic') return 'success';
    if (auth === 'FAKE' || auth === 'fake') return 'error';
    return 'warning';
  };

  const getCredibilityColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'error';
  };

  return (
    <Stack spacing={4}>
      <Paper sx={{ p: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Professional News Analysis
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Get comprehensive analysis with industry classification, language detection, country origin, and quantified ML scores
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Text Analysis
        </Typography>
        <TextField 
          label="Paste news article or text" 
          multiline 
          minRows={6} 
          value={text} 
          onChange={e => setText(e.target.value)} 
          fullWidth 
          placeholder="Enter news text to analyze..."
        />
        <Button 
          sx={{ mt: 2 }} 
          variant="contained" 
          size="large"
          onClick={analyzeText} 
          disabled={!text.trim() || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Analytics />}
        >
          Analyze News
        </Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Media Analysis
        </Typography>
        <Box 
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} 
          onDragLeave={() => setDragOver(false)} 
          onDrop={(e) => {
            e.preventDefault(); 
            setDragOver(false); 
            const f = e.dataTransfer.files?.[0]; 
            if (f) setFile(f);
          }} 
          sx={{
            mt: 1,
            p: 4,
            border: '2px dashed',
            borderColor: dragOver ? 'primary.main' : 'divider',
            borderRadius: 2,
            backgroundColor: dragOver ? 'rgba(15,98,254,0.06)' : 'rgba(0,0,0,0.02)',
            textAlign: 'center',
            cursor: 'pointer'
          }}
        >
          <input 
            type="file" 
            accept="image/*,video/*" 
            onChange={e => setFile(e.target.files?.[0])} 
            style={{ display: 'none' }}
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Typography variant="body2" sx={{ color: 'text.secondary', cursor: 'pointer' }}>
              Drag & drop media here or click to choose a file
            </Typography>
          </label>
          {file && (
            <Typography sx={{ mt: 1, fontWeight: 500 }}>
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </Typography>
          )}
        </Box>
        <Button 
          sx={{ mt: 2 }} 
          variant="outlined" 
          size="large"
          onClick={analyzeMedia} 
          disabled={!file || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Analytics />}
        >
          Analyze Media
        </Button>
      </Paper>

      {error && (
        <Alert severity="error">{error}</Alert>
      )}

      {loading && <LinearProgress />}

      {result && (
        <Paper sx={{ p: 4, background: '#f8f9fa' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
            Analysis Results
          </Typography>

          {/* Authenticity Result */}
          <Card sx={{ mb: 3, borderLeft: `4px solid ${getAuthenticityColor(result) === 'success' ? '#4caf50' : getAuthenticityColor(result) === 'error' ? '#f44336' : '#ff9800'}` }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                {getAuthenticityColor(result) === 'success' ? (
                  <CheckCircle color="success" sx={{ fontSize: 40 }} />
                ) : (
                  <Cancel color="error" sx={{ fontSize: 40 }} />
                )}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {result?.authenticity?.result || result?.result || 'UNKNOWN'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Confidence: {(result?.authenticity?.confidence || result?.confidence || 0).toFixed(1)}%
                  </Typography>
                </Box>
              </Stack>
              {result?.authenticity?.fake_probability && (
                <Alert severity={result.authenticity.fake_probability > 60 ? 'warning' : 'info'} sx={{ mt: 1 }}>
                  Fake News Probability: {result.authenticity.fake_probability.toFixed(1)}%
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Comprehensive Analysis Grid */}
          {result.authenticity && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* Language */}
              {result.language && (
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <Language color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>Language</Typography>
                      </Stack>
                      <Typography variant="h6">{result.language.detected}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {result.language.confidence}% confidence
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Country */}
              {result.country && (
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <Public color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>Country</Typography>
                      </Stack>
                      <Typography variant="h6">{result.country.detected}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {result.country.confidence}% confidence
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Industry */}
              {result.industry && (
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <Work color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>Industry</Typography>
                      </Stack>
                      <Typography variant="h6">{result.industry.category}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {result.industry.confidence}% confidence
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Sentiment */}
              {result.sentiment && (
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <SentimentSatisfied color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>Sentiment</Typography>
                      </Stack>
                      <Typography variant="h6">{result.sentiment.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Score: {result.sentiment.score.toFixed(1)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Credibility */}
              {result.credibility && (
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ border: `2px solid ${getCredibilityColor(result.credibility.score) === 'success' ? '#4caf50' : getCredibilityColor(result.credibility.score) === 'warning' ? '#ff9800' : '#f44336'}` }}>
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <Verified color={getCredibilityColor(result.credibility.score)} />
                        <Typography variant="subtitle2" fontWeight={600}>Credibility</Typography>
                      </Stack>
                      <Typography variant="h6">{result.credibility.score.toFixed(1)}%</Typography>
                      <Chip 
                        label={result.credibility.level} 
                        size="small" 
                        color={getCredibilityColor(result.credibility.score)}
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Metrics */}
              {result.metrics && (
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <TrendingUp color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>Metrics</Typography>
                      </Stack>
                      <Typography variant="body2">Words: {result.metrics.word_count}</Typography>
                      <Typography variant="body2">Characters: {result.metrics.character_count}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}

          {/* Risk Indicators */}
          {result.risk_indicators && result.risk_indicators.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Risk Indicators
              </Typography>
              <Stack spacing={1}>
                {result.risk_indicators.map((indicator, idx) => (
                  <Alert key={idx} severity="warning" icon={<Warning />}>
                    {indicator}
                  </Alert>
                ))}
              </Stack>
            </Box>
          )}

          {/* User Flags */}
          <Divider sx={{ my: 3 }} />
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Community Verification
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                color="success"
                startIcon={<Flag />}
                onClick={() => submitFlag('green')}
              >
                Green Flag ({result.userFlags?.green || 0})
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Flag />}
                onClick={() => submitFlag('red')}
              >
                Red Flag ({result.userFlags?.red || 0})
              </Button>
              {result.userFlags?.platforms && Object.keys(result.userFlags.platforms).length > 0 && (
                <Box sx={{ ml: 'auto' }}>
                  <Typography variant="caption" color="text.secondary">
                    Flags from: {Object.keys(result.userFlags.platforms).join(', ')}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Paper>
      )}
    </Stack>
  );
}
