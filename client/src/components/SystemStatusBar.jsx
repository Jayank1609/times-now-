import React, { useEffect, useState } from 'react';
import {
  Paper,
  Grid,
  Stack,
  Typography,
  Chip,
  LinearProgress,
  Tooltip,
  Box
} from '@mui/material';
import {
  CloudDone,
  Memory,
  Storage,
  Bolt,
  WarningAmber
} from '@mui/icons-material';
import axios from 'axios';

const initialState = {
  loading: true,
  api: 'pending',
  database: 'pending',
  ml: {
    status: 'pending',
    modelReady: false,
    transformers: false,
    langdetect: false,
    textblob: false
  },
  latency: null,
  updatedAt: null,
  error: null
};

const pulseDot = (color) => ({
  width: 10,
  height: 10,
  borderRadius: '50%',
  backgroundColor: color,
  boxShadow: `0 0 12px ${color}`
});

const formatTimestamp = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleTimeString();
  } catch {
    return '—';
  }
};

export default function SystemStatusBar() {
  const [status, setStatus] = useState(initialState);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      try {
        const { data } = await axios.get('/api/health');
        if (cancelled) return;
        const latency = Math.max(
          1,
          Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - start)
        );
        setStatus({
          loading: false,
          api: data.api || 'unknown',
          database: data.database || 'unknown',
          ml: data.ml || initialState.ml,
          latency,
          updatedAt: new Date().toISOString(),
          error: null
        });
      } catch (err) {
        if (cancelled) return;
        setStatus((prev) => ({
          ...prev,
          loading: false,
          api: 'error',
          error: err.message
        }));
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 20000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const apiUp = status.api === 'ok';
  const mlUp = status.ml?.status === 'ok';
  const dbReady = status.database && status.database !== 'unknown';

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(120deg, rgba(9,11,25,0.92), rgba(22,8,38,0.9))',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 20% 20%, rgba(227,24,55,0.15), transparent 45%)',
          pointerEvents: 'none'
        }}
      />
      {status.loading && <LinearProgress sx={{ position: 'absolute', inset: 0, opacity: 0.15 }} />}

      <Grid container spacing={3} sx={{ position: 'relative' }}>
        <Grid item xs={12} md={3}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={pulseDot(apiUp ? '#4caf50' : '#ff9800')} />
              <Typography variant="overline" sx={{ letterSpacing: 1.5 }}>
                Command Center
              </Typography>
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {apiUp && mlUp ? 'All Systems Operational' : 'Review System Status'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              Latency: {status.latency ? `${status.latency}ms` : '—'} · Updated {formatTimestamp(status.updatedAt)}
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} md={3}>
          <Stack spacing={1.2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CloudDone fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                API Core
              </Typography>
            </Stack>
            <Chip
              label={apiUp ? 'Operational' : status.api === 'error' ? 'Unreachable' : status.api}
              color={apiUp ? 'success' : 'warning'}
              size="small"
              sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
            />
            {status.error && (
              <Typography variant="caption" sx={{ color: '#ffb74d' }}>
                {status.error}
              </Typography>
            )}
          </Stack>
        </Grid>

        <Grid item xs={12} md={3}>
          <Stack spacing={1.2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Memory fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                ML Engine
              </Typography>
            </Stack>
            <Chip
              label={mlUp ? 'Ready' : 'Bootstrapping'}
              color={mlUp ? 'success' : 'warning'}
              size="small"
              sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
            />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {['transformers', 'modelReady', 'langdetect', 'textblob'].map((capability) => (
                <Tooltip
                  key={capability}
                  title={capability === 'modelReady' ? 'Inference pipeline warmed' : `Dependency: ${capability}`}
                >
                  <Chip
                    size="small"
                    label={capability}
                    color={status.ml?.[capability] ? 'success' : 'default'}
                    sx={{ textTransform: 'capitalize', mr: 0.5, mb: 0.5 }}
                  />
                </Tooltip>
              ))}
            </Stack>
          </Stack>
        </Grid>

        <Grid item xs={12} md={3}>
          <Stack spacing={1.2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Storage fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Data Fabric
              </Typography>
            </Stack>
            <Chip
              label={dbReady ? status.database : 'In-memory'}
              color={dbReady ? 'primary' : 'default'}
              size="small"
              sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
            />
            <Stack direction="row" spacing={1} alignItems="center">
              {dbReady ? <Bolt sx={{ fontSize: 18, color: '#4caf50' }} /> : <WarningAmber sx={{ fontSize: 18, color: '#ff9800' }} />}
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {dbReady ? 'MongoDB link active' : 'Fallback memory datastore in use'}
              </Typography>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}


