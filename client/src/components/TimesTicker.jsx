import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';

const scroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const headlineItems = [
  { label: 'Global Trust', value: '98.2% verified publishers', tone: 'success' },
  { label: 'Times Square Live', value: 'Real-time authenticity radar online', tone: 'neutral' },
  { label: 'Emerging Risks', value: '17 critical narratives flagged', tone: 'warning' },
  { label: 'Community', value: '42,000+ analyst votes this week', tone: 'info' },
  { label: 'AI Confidence', value: 'Avg. ML certainty 91.4%', tone: 'success' },
  { label: 'Media Watch', value: 'Deepfake attempts down 12%', tone: 'neutral' }
];

const tonePalette = {
  success: { bg: 'rgba(76, 175, 80, 0.12)', color: '#2e7d32' },
  warning: { bg: 'rgba(255, 152, 0, 0.12)', color: '#ef6c00' },
  info: { bg: 'rgba(3, 169, 244, 0.12)', color: '#0277bd' },
  neutral: { bg: 'rgba(255,255,255,0.08)', color: '#f5f5f5' }
};

export default function TimesTicker() {
  const duplicated = [...headlineItems, ...headlineItems];

  return (
    <Box
      sx={{
        overflow: 'hidden',
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'linear-gradient(90deg, rgba(0,0,0,0.55), rgba(15,23,42,0.7))',
        color: 'white',
        position: 'relative'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          minWidth: '200%',
          animation: `${scroll} 45s linear infinite`,
          py: 1.5,
          px: 2
        }}
      >
        {duplicated.map((item, idx) => {
          const tones = tonePalette[item.tone] || tonePalette.neutral;
          return (
            <Box
              key={`${item.label}-${idx}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Chip
                label={item.label}
                size="small"
                sx={{
                  backgroundColor: tones.bg,
                  color: tones.color,
                  borderRadius: 1.5,
                  fontWeight: 600
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  letterSpacing: 0.2,
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.85)'
                }}
              >
                {item.value}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

