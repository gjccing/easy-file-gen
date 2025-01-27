import { createSignal } from "solid-js";
import { showToast } from "~/components/ui/toast";

export function createDataLoader(
  cb: (...args) => Promise<void>,
  getErrorMessage?: (error: any) => string | undefined
) {
  const [error, setError] = createSignal<any>();
  const [loading, setLoading] = createSignal<boolean>(false);
  const load = async (...args) => {
    try {
      setError(undefined);
      setLoading(true);
      await cb(...args);
    } catch (e) {
      showToast({
        title:
          getErrorMessage?.(e) ??
          "Something went wrong. Please contact us for assistance.",
        variant: "error",
      });
      setError(e);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  return [load, loading, error];
}
