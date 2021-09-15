const cjs_to_esm_plugin = {
  name: 'cjs-to-esm',
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      if (args.importer === '') return { path: args.path, namespace: 'c2e' }
    })
    build.onLoad({ filter: /.*/, namespace: 'c2e' }, (args) => {
      const keys = Object.keys(require(args.path)).join(', ')
      const path = JSON.stringify(args.path)
      const resolveDir = __dirname
      return {
        contents: `
          import * as m from ${path};
          import { ${keys} } from ${path};
          export { ${keys} };
          export default m;
        `,
        resolveDir,
      }
    })
  },
}

function esModuleBuild(path) {
  return require('esbuild').build({
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
    plugins: [cjs_to_esm_plugin],
  })
}

module.exports = {
  esModuleBuild: esModuleBuild,
}
