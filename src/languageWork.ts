export interface IWorkerDefinition {
  label: string
  entry: string
}

const builtinLanguageLabels = [
  'editorWorkerService',
  'css',
  'html',
  'json',
  'typescript',
] as const

type BuiltinLanguageLabel = (typeof builtinLanguageLabels)[number]

type DeprecatedLanguageLabel =
  | 'languages.css'
  | 'languages.html'
  | 'languages.json'
  | 'languages.typescript'

export type EditorLanguageWorks = BuiltinLanguageLabel | DeprecatedLanguageLabel

type BuiltinWorkerDefinition = IWorkerDefinition & { label: BuiltinLanguageLabel }

export const languageWorkAttr = [
  {
    label: 'editorWorkerService',
    entry: 'monaco-editor/esm/vs/editor/editor.worker',
  },
  {
    label: 'css',
    entry: 'monaco-editor/esm/vs/language/css/css.worker',
  },
  {
    label: 'html',
    entry: 'monaco-editor/esm/vs/language/html/html.worker',
  },
  {
    label: 'json',
    entry: 'monaco-editor/esm/vs/language/json/json.worker',
  },
  {
    label: 'typescript',
    entry: 'monaco-editor/esm/vs/language/typescript/ts.worker',
  },
] satisfies BuiltinWorkerDefinition[]

const legacyNamespaceAliasMap: Record<DeprecatedLanguageLabel, BuiltinLanguageLabel> = {
  'languages.css': 'css',
  'languages.html': 'html',
  'languages.json': 'json',
  'languages.typescript': 'typescript',
}

export function normalizeLanguageLabel(label: EditorLanguageWorks): BuiltinLanguageLabel {
  return (legacyNamespaceAliasMap[label as DeprecatedLanguageLabel] ?? label) as BuiltinLanguageLabel
}

const languageWorksByLabel: Record<BuiltinLanguageLabel, BuiltinWorkerDefinition> =
  languageWorkAttr.reduce((acc, languageWork) => {
    acc[languageWork.label] = languageWork
    return acc
  }, {} as Record<BuiltinLanguageLabel, BuiltinWorkerDefinition>)

export { languageWorksByLabel }

export const builtinLanguageWorkerLabels: BuiltinLanguageLabel[] = languageWorkAttr.map(
  (languageWork) => languageWork.label
)
