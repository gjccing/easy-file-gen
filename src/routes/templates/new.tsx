import { useNavigate } from "@solidjs/router";
import DashboardLayout from "~/components/layout/DashboardLayout";
import { TemplateForm } from "~/components/templates/TemplateForm";
import { showToast } from "~/components/ui/toast";
import { createNewTemplate } from "~/lib/api/templates";

export default function New() {
  const navigate = useNavigate();
  return (
    <DashboardLayout title="Create New Template">
      <div class="flex items-center justify-between space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Create New Template</h1>
      </div>
      <div class="flex flex-col gap-4 relative">
        <TemplateForm
          class="test"
          onSubmit={async (data) => {
            try {
              await createNewTemplate(data);
              navigate("/templates");
            } catch (e) {
              showToast({
                title:
                  "Something went wrong. Please contact us for assistance.",
                variant: "error",
              });
              console.error(e);
            }
          }}
        />
      </div>
    </DashboardLayout>
  );
}
