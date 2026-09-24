export const is = {
  dev: !!process.env['ELECTRON_RENDERER_URL'] || process.env['NODE_ENV'] === 'development'
}
