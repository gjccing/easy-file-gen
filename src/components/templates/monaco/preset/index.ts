import { SupportedEngine } from "~/global";
import PRESET_REACT_PDF_RENDERER_3_4_4 from "./@react-pdf/renderer@3.4.4";

const PRESET_RECORD: Record<SupportedEngine, () => EDITOR_PRESET> = {
  "@react-pdf/renderer@3.4.4": PRESET_REACT_PDF_RENDERER_3_4_4,
};
export default PRESET_RECORD;
