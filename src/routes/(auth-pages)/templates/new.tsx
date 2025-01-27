import { useNavigate } from "@solidjs/router";
import Page from "~/components/Page";
import { TemplateForm } from "~/components/templates/TemplateForm";
import { createDataLoader } from "~/lib/api/createFetchData";
import { createNewTemplate } from "~/lib/api/templates";

export default function New() {
  const navigate = useNavigate();
  const [load] = createDataLoader(async (value) => {
    await createNewTemplate(value);
    navigate("/templates");
  });
  return (
    <Page title="Create New Template">
      <TemplateForm onSubmit={load} />
    </Page>
  );
}
