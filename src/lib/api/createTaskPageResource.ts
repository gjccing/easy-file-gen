import { createSignal, onMount } from "solid-js";
import {
  getTaskFirstPage,
  getTaskPageStartAfterCreateAt,
} from "~/lib/api/tasks";
import { createDataLoader } from "./createFetchData";

export const LIMIT_NUMBER = 10;

export function createTaskPageResource(props: { templateId: string }) {
  const [tasks, setTasks] = createSignal<Model.Task[]>([]);
  const [loadNext, loading, error] = createDataLoader(async () => {
    const _data = tasks();
    const createAt = _data[_data.length - 1]?.createdAt;
    setTasks(
      await (createAt
        ? getTaskPageStartAfterCreateAt(
            props.templateId,
            LIMIT_NUMBER,
            createAt
          )
        : getTaskFirstPage(props.templateId, LIMIT_NUMBER))
    );
  });
  onMount(loadNext);
  return { tasks, loading, error, loadNext, reset: () => setTasks([]) };
}
