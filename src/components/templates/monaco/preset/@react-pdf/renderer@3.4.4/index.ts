import * as monaco from "monaco-editor"; // client only

export default (): EDITOR_PRESET => {
  let typescriptDefaultsCompilerOptions: monaco.languages.typescript.CompilerOptions =
    {};
  let typescriptDefaultsDiagnosticsOptions: monaco.languages.typescript.DiagnosticsOptions =
    {};
  let models: monaco.editor.ITextModel[] = [];
  return {
    createEditorConstructionOptions: async (
      initialModel?: monaco.editor.ITextModel
    ) => ({
      language: "typescript",
      model:
        initialModel ??
        (models[0] = monaco.editor.createModel(
          (await import("./template.tsx?raw")).default,
          "typescript",
          monaco.Uri.parse("file:///template.tsx")
        )),
      minimap: { enabled: false },
      automaticLayout: true,
      scrollBeyondLastLine: false,
    }),
    onAfterCreatedEditor: async (editor) => {
      typescriptDefaultsCompilerOptions =
        monaco.languages.typescript.typescriptDefaults.getCompilerOptions();
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        ...typescriptDefaultsCompilerOptions,
        jsx: monaco.languages.typescript.JsxEmit.Preserve,
        strict: true,
      });
      typescriptDefaultsDiagnosticsOptions =
        monaco.languages.typescript.typescriptDefaults.getDiagnosticsOptions();
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        ...typescriptDefaultsDiagnosticsOptions,
        noSemanticValidation: false,
        noSyntaxValidation: false,
        diagnosticCodesToIgnore: [2792],
      });
    },
    onAfterDisposedEditor: (_) => {
      models.forEach((model) => model.dispose());
      models = [];
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
        typescriptDefaultsCompilerOptions
      );
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
        typescriptDefaultsDiagnosticsOptions
      );
    },
  };
};
