import React, { useState } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Stack,
  IconButton,
  Button,
  Chip,
  Fade,
  Tooltip
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import theme from './theme';
import { arabicToRoman, romanToArabic } from './utils/romanNumeral';

function App() {
  const [roman, setRoman] = useState('');
  const [arabic, setArabic] = useState('');
  const [romanError, setRomanError] = useState('');
  const [arabicError, setArabicError] = useState('');

  // Handle Roman numeral input change (Left -> Right)
  const handleRomanChange = (value) => {
    setRoman(value);
    
    const trimmed = value.trim();
    if (trimmed === '') {
      // Empty input: clear both sides and errors
      setArabic('');
      setRomanError('');
      setArabicError('');
      return;
    }

    const converted = romanToArabic(trimmed);
    if (converted !== null) {
      // Valid conversion: update Arabic value, clear errors
      setArabic(String(converted));
      setRomanError('');
      setArabicError('');
    } else {
      // Invalid conversion: keep last valid Arabic value, show error on Roman side
      setRomanError('請輸入 1–3999 之間的合法羅馬數字 (例如: IX, MCMXCIV)');
    }
  };

  // Handle Arabic numeral input change (Right -> Left)
  const handleArabicChange = (value) => {
    setArabic(value);

    const trimmed = value.trim();
    if (trimmed === '') {
      // Empty input: clear both sides and errors
      setRoman('');
      setRomanError('');
      setArabicError('');
      return;
    }

    // Check if input is a valid integer format
    const parsed = Number(trimmed);
    if (!/^\d+$/.test(trimmed) || !Number.isInteger(parsed) || parsed < 1 || parsed > 3999) {
      // Invalid conversion: keep last valid Roman value, show error on Arabic side
      setArabicError('請輸入 1–3999 之間的整數');
      return;
    }

    const converted = arabicToRoman(parsed);
    if (converted !== null) {
      // Valid conversion: update Roman value, clear errors
      setRoman(converted);
      setRomanError('');
      setArabicError('');
    } else {
      setArabicError('請輸入 1–3999 之間的整數');
    }
  };

  // Clear all fields
  const handleClear = () => {
    setRoman('');
    setArabic('');
    setRomanError('');
    setArabicError('');
  };

  // Set quick template values
  const handleQuickSelect = (num) => {
    const rom = arabicToRoman(num);
    setArabic(String(num));
    setRoman(rom);
    setRomanError('');
    setArabicError('');
  };

  const quickTemplates = [
    { label: '4 (IV)', value: 4 },
    { label: '9 (IX)', value: 9 },
    { label: '99 (XCIX)', value: 99 },
    { label: '444 (CDXLIV)', value: 444 },
    { label: '1994 (MCMXCIV)', value: 1994 },
    { label: '2026 (MMXXVI)', value: 2026 },
    { label: '3999 (MMMCMXCIX)', value: 3999 }
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', py: 8 }}>
        {/* Glow effect background */}
        <div className="glow-bg" />

        <Container maxWidth="md" sx={{ zIndex: 1, position: 'relative' }}>
          {/* Header section */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 2 }}>
              羅馬數字 ⇄ 阿拉伯數字
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto', fontSize: '1.1rem' }}>
              一個雙向、即時同步的數值轉換工具。在任意一側輸入數值，另一側將即時進行解析與格式驗證。
            </Typography>
          </Box>

          {/* Main Card */}
          <Card>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={{ xs: 3, md: 4 }}
                alignItems="center"
                justifyContent="center"
              >
                {/* Left Side: Roman Numeral Input */}
                <Box sx={{ width: '100%' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
                    羅馬數字 (Roman Numeral)
                  </Typography>
                  <TextField
                    id="roman-input"
                    fullWidth
                    variant="outlined"
                    placeholder="例如: MCMXCIV"
                    value={roman}
                    onChange={(e) => handleRomanChange(e.target.value)}
                    error={!!romanError}
                    helperText={romanError}
                    inputProps={{
                      style: { textTransform: 'uppercase', fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 600 }
                    }}
                    sx={{
                      '& input::placeholder': {
                        textTransform: 'none',
                        fontFamily: 'inherit',
                        fontSize: '1rem',
                        fontWeight: 'normal'
                      }
                    }}
                  />
                </Box>

                {/* Central Icon */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <IconButton
                    disabled
                    sx={{
                      color: 'primary.main',
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                      transform: { xs: 'rotate(90deg)', md: 'none' },
                      width: 48,
                      height: 48,
                      '&.Mui-disabled': {
                        color: 'primary.main',
                        backgroundColor: 'rgba(99, 102, 241, 0.08)'
                      }
                    }}
                  >
                    <SwapHorizIcon sx={{ fontSize: 28 }} />
                  </IconButton>
                </Box>

                {/* Right Side: Arabic Numeral Input */}
                <Box sx={{ width: '100%' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
                    阿拉伯數字 (Arabic Numeral)
                  </Typography>
                  <TextField
                    id="arabic-input"
                    fullWidth
                    variant="outlined"
                    placeholder="例如: 1994"
                    value={arabic}
                    onChange={(e) => handleArabicChange(e.target.value)}
                    error={!!arabicError}
                    helperText={arabicError}
                    inputProps={{
                      style: { fontSize: '1.25rem', fontWeight: 600 },
                      inputMode: 'numeric',
                      pattern: '[0-9]*'
                    }}
                  />
                </Box>
              </Stack>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={handleClear}
                  disabled={!roman && !arabic}
                  sx={{ borderColor: 'rgba(255, 255, 255, 0.15)', '&:hover': { borderColor: 'rgba(255, 255, 255, 0.3)' } }}
                >
                  清除欄位
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Quick Examples Selection */}
          <Box sx={{ mt: 5, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
              快速測試範例：
            </Typography>
            <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" justifyContent="center">
              {quickTemplates.map((item) => (
                <Chip
                  key={item.value}
                  label={item.label}
                  onClick={() => handleQuickSelect(item.value)}
                  clickable
                  variant="outlined"
                  sx={{
                    borderRadius: '8px',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    py: 2,
                    fontSize: '0.875rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      borderColor: 'primary.main',
                      color: 'white',
                      transform: 'translateY(-2px)'
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Rules Card / Explanation */}
          <Card sx={{ mt: 6, backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HelpOutlineIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: 'secondary.light' }}>
                  傳統羅馬數字規則說明
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                1. 傳統羅馬數字系統不包含 0，其表示範圍限定在 <strong>1 至 3999 (I 至 MMMCMXCIX)</strong>。
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                2. <strong>基本字符</strong>：I (1), V (5), X (10), L (50), C (100), D (500), M (1000)。
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                3. <strong>加減法則</strong>：相同的字符最多連續出現 3 次（例如 III 表示 3，但 4 不寫成 IIII，而是 IV）。當較小的數值字符在較大的數值字符左側時，代表相減（如 IV = 5 - 1 = 4；IX = 10 - 1 = 9）；在右側時代表相加（如 VI = 5 + 1 = 6）。
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
