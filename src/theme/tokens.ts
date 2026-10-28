/**
 * Tokens del design system de Lapticon (design/lapticon_design_system/DESIGN.md).
 * Único origen de colores, tipografía, radios, espaciados y sombras:
 * tailwind.config.ts los consume, así que cualquier ajuste visual se hace aquí.
 */

export const colors = {
  // Marca
  navy: '#0B1240', // Azul marino: marca, textos y íconos de alto énfasis
  'navy-soft': '#545B8C', // Detalles decorativos (línea de ruta, ilustraciones)
  wine: '#A50012', // Rojo vino: solo CTA principales y estados de error
  'wine-pressed': '#87000F',
  air: '#2563EB', // Azul aire: enlaces e insignias de confianza

  // Superficies
  surface: '#F8F9FF', // Fondo de pantalla
  card: '#FFFFFF', // Tarjetas y hojas
  field: '#EFF4FF', // Fondo de inputs
  'field-focus': '#E5EEFF',
  chip: '#DCE9FF', // Chips e ilustraciones circulares
  'chip-strong': '#D3E4FE',
  divider: '#D3E4FE',
  readonly: '#F1F4F9', // Campos bloqueados (p. ej. correo en Editar perfil)

  // Texto
  'on-surface': '#0B1C30',
  'on-surface-variant': '#46464F',
  muted: '#64748B', // Slate: metadatos y placeholders
  outline: '#777680',

  // Estados
  'error-bg': '#FFF1EF',
  success: '#059669',
  'success-bg': '#E6F9F0', // Banner "Datos actualizados correctamente"
  'success-strong': '#0B7A48',
} as const;

export const fontFamily = {
  sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
};

type FontSpec = [string, { lineHeight: string; letterSpacing?: string; fontWeight: string }];

export const fontSize: Record<string, FontSpec> = {
  display: ['36px', { lineHeight: '44px', letterSpacing: '-0.03em', fontWeight: '800' }],
  'headline-lg': ['30px', { lineHeight: '38px', letterSpacing: '-0.02em', fontWeight: '700' }],
  'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '700' }],
  'headline-sm': ['20px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '600' }],
  'title-md': ['17px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '600' }],
  'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
  'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
  'body-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
  'label-lg': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '600' }],
  'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '600' }],
  'label-caps': ['11px', { lineHeight: '14px', letterSpacing: '0.06em', fontWeight: '700' }],
};

export const borderRadius = {
  sm: '0.25rem',
  DEFAULT: '0.5rem', // Chips y badges
  control: '0.75rem', // Inputs y botones (como en las capturas de Stitch)
  card: '1rem', // Tarjetas y hojas
  full: '9999px',
};

export const spacing = {
  'space-xs': '0.25rem',
  'space-sm': '0.5rem',
  'space-md': '1rem',
  'space-lg': '1.5rem',
  'space-xl': '2rem',
  'margin-mobile': '1rem',
  'gutter-mobile': '0.75rem',
};

export const boxShadow = {
  card: '0 2px 8px -2px rgba(11, 18, 64, 0.05), 0 1px 3px 0 rgba(11, 18, 64, 0.03)',
  raised: '0 12px 28px -6px rgba(11, 18, 64, 0.12), 0 4px 10px -2px rgba(11, 18, 64, 0.04)',
  cta: '0 4px 12px -2px rgba(165, 0, 18, 0.25)',
  bar: '0 1px 8px rgba(0, 0, 0, 0.04)',
};

export const size = {
  field: '52px',
  button: '54px',
};
