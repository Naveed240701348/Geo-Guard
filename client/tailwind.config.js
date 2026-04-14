module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#080f1a',
        panel:   '#0d1726',
        border:  '#1a2d45',
        primary: '#10d97a',
        danger:  '#ff4557',
        info:    '#3b9eff',
        warning: '#f5c518',
        muted:   '#5a7a99'
      },
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace']
      }
    }
  }
};
