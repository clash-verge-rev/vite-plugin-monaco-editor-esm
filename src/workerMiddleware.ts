import { Connect, ResolvedConfig } from 'vite'
import { getWorks, IMonacoEditorOpts, isCDN, resolveMonacoPath } from './index.js'
import { IWorkerDefinition, languageWorksByLabel } from './languageWork.js'
import * as esbuild from 'esbuild'
import * as fs from 'fs'
import * as path from 'path'

export function getFilenameByEntry(entry: string) {
  entry = path.basename(entry, 'js')
  return entry + '.bundle.js'
}

export const cacheDir = 'node_modules/.monaco/'

export function getWorkPath(
  works: IWorkerDefinition[],
  options: IMonacoEditorOpts,
  config: ResolvedConfig
) {
  const workerPaths: Record<string, any> = {}
  for (const work of works) {
    if (isCDN(options.publicPath ?? '')) {
      workerPaths[work.label] = options.publicPath + '/' + getFilenameByEntry(work.entry)
    } else {
      workerPaths[work.label] =
        config.base + options.publicPath + '/' + getFilenameByEntry(work.entry)
    }
  }

  const workerLabelAliases: Record<string, string[]> = {
    typescript: ['javascript', 'languages.typescript'],
    css: ['less', 'scss', 'languages.css'],
    html: ['handlebars', 'razor', 'languages.html'],
    json: ['languages.json'],
  }

  for (const [label, aliases] of Object.entries(workerLabelAliases)) {
    const workerUrl = workerPaths[label]
    if (!workerUrl) {
      continue
    }
    for (const alias of aliases) {
      workerPaths[alias] = workerUrl
    }
  }

  return workerPaths
}

export function workerMiddleware(
  middlewares: Connect.Server,
  config: ResolvedConfig,
  options: IMonacoEditorOpts
): void {
  const works = getWorks(options)
  if (!works) {
    throw new Error('No work definition found.')
  }
  // clear cacheDir

  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true } as fs.RmDirOptions)
  }

  for (const work of works) {
    middlewares.use(
      config.base + options.publicPath + '/' + getFilenameByEntry(work.entry),
      function (req, res, next) {
        if (!fs.existsSync(cacheDir + getFilenameByEntry(work.entry))) {
          esbuild.buildSync({
            entryPoints: [resolveMonacoPath(work.entry)],
            bundle: true,
            outfile: cacheDir + getFilenameByEntry(work.entry),
          })
        }
        const contentBuffer = fs.readFileSync(cacheDir + getFilenameByEntry(work.entry))
        res.setHeader('Content-Type', 'text/javascript')
        res.end(contentBuffer)
      }
    )
  }
}
