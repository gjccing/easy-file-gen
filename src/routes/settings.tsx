import { onMount, Switch, Match, For, Show } from "solid-js";
import DashboardLayout from "~/components/layout/DashboardLayout";
import { SettingsForm } from "~/components/settings/SettingsForm";

export default function New() {
  return (
    <DashboardLayout title="Create New Template">
      <div class="flex items-center justify-between space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Create New Template</h1>
      </div>
      <div class="flex flex-col gap-4 relative">
        <SettingsForm
          class="test"
          onSubmit={(value) => {
            console.log(value);
          }}
        />
      </div>
    </DashboardLayout>
  );
}
