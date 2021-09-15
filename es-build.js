function esModuleBuild(path) {
  return require('esbuild').buildSync({
    target: 'esnext',
    format: 'esm',
    bundle: true,
    logLevel: 'silent',
    splitting: true,
    entryPoints: path,
    outdir: '.gvite',
    define: {
      'process.env.NODE_ENV': JSON.stringify('development'),
    },
    // plugins: [cjs_to_esm_plugin],
  })
}

module.exports = {
  esModuleBuild: esModuleBuild,
}
