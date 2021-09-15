const list = {}

let makeAllPackagesExternalPlugin = {
  name: 'make-all-packages-external',
  setup(build) {
    let filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/ // Must not start with "/" or "./" or "../"
    build.onResolve({ filter: filter }, (args) => {
      list[args.path] = 1
      return { path: args.path, external: true }
    })
  },
}


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

function preBuild() {
  return require('esbuild')
    .build({
      target: 'esnext',
      format: 'esm',
      logLevel: 'verbose',
      bundle: true,
      entryPoints: ['./src/main.tsx'],
      loader: { '.svg': 'text', '.css': 'text' },
      // outdir: 'temp',
      // define: {
      //   'process.env.NODE_ENV': JSON.stringify('development'),
      // },
      plugins: [
        makeAllPackagesExternalPlugin,
      ],
    })
    .then((v) => {
      return esModuleBuild(Object.keys(list))
    })
}

module.exports = {
  esModuleBuild: esModuleBuild,
  preBuild: preBuild,
}
