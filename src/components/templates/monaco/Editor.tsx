import { createEffect, onCleanup } from "solid-js";
import * as monaco from "monaco-editor";
import PRESET_RECORD from "./preset";
import { cn } from "~/lib/utils";
import { SupportedEngine } from "~/global";

export default function (props: {
  class?: string;
  preset: SupportedEngine;
  initialValue?: File;
  onChange?: (value: File, compiledValue?: File) => void;
}) {
  let container: HTMLDivElement | undefined;
  let preset: EDITOR_PRESET | undefined;
  let editor: monaco.editor.IStandaloneCodeEditor | undefined;
  let initialModel: monaco.editor.ITextModel | undefined;
  const handleChange = async () => {
    if (editor && props.onChange) {
      let value = new File(
        [editor.getValue()],
        (editor.getModel()?.uri.toString() ?? "").replace(/^.*\//, ""),
        { type: `text/${editor.getModel()?.getLanguageId() ?? "plain"}` }
      );
      props.onChange(value, await preset?.preprocessBeforeChange?.(value));
    }
  };
  const disposeEditor = () => {
    if (editor && preset) {
      editor.dispose();
      initialModel?.dispose();
      preset.onAfterDisposedEditor?.(editor);
      preset = undefined;
      editor = undefined;
    }
  };
  const createEditor = async () => {
    if (container && !(editor && preset)) {
      preset = PRESET_RECORD[props.preset]();
      if (props.initialValue) {
        initialModel = monaco.editor.createModel(
          await props.initialValue.text(),
          props.initialValue.type.slice(5),
          monaco.Uri.parse(`file:///${props.initialValue.name}`)
        );
      }
      const options =
        (await preset.createEditorConstructionOptions?.(initialModel)) ?? {};
      editor = monaco.editor.create(container, options);
      await preset.onAfterCreatedEditor?.(editor);
      editor.getValue()?.length > 0 && handleChange();
      editor.onDidChangeModelContent(handleChange);
    }
  };
  createEffect((prePreset) => {
    if (prePreset !== props.preset) {
      disposeEditor();
      createEditor();
    }
    return props.preset;
  });
  onCleanup(disposeEditor);

  return <div ref={container} class={cn(props.class)} />;
}
