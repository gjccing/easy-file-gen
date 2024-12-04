import * as DialogPrimitive from "@kobalte/core/dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { createSignal } from "solid-js";
import { IconLoader } from "~/components/icons";

export default function WebhookDeleteDialog(
  props: Parameters<typeof DialogTrigger>[0] & {
    onDelete?: () => void | Promise<void>;
  }
) {
  const [open, setOpen] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  async function handleDelete() {
    try {
      setLoading(true);
      await props.onDelete?.();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Dialog open={open()} onOpenChange={(value) => loading() || setOpen(value)}>
      <DialogTrigger {...props} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to delete the Webhook settings?
          </DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={loading()}
            onClick={handleDelete}
          >
            {loading() && <IconLoader class="mr-2 size-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
