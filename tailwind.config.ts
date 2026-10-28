import type { Config } from 'tailwindcss';
import { borderRadius, boxShadow, colors, fontFamily, fontSize, size, spacing } from './src/theme/tokens';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors,
      fontFamily,
      fontSize,
      borderRadius,
      spacing,
      boxShadow,
      height: size,
      minHeight: size,
      maxWidth: { app: '480px' },
    },
  },
  plugins: [],
} satisfies Config;
