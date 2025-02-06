import { Title } from "@solidjs/meta";
import Nav from "~/components/Nav";

export default function About() {
  return (
    <div class="flex flex-col h-svh">
      <Nav />
      <div class="flex-1 space-y-4 p-8 pt-6">
        <main class="mx-auto text-gray-700 p-4">
          <Title>About</Title>
          <div class=" mx-auto max-w-3xl">
            <h1 class="max-6-xs text-4xl text-sky-700 my-16 text-center">
              Service prototype supporting multiple languages ​​and file
              generation templates
            </h1>
            <h2 class="text-3xl my-8">Introduction</h2>
            <p class="my-4">
              Many software services require the generation of files as part of
              their features, even when file generation is not their primary
              business. When file generation logic is not properly separated
              (e.g., kept within the main service rather than on a dedicated
              server), it can lead to potential performance issues in the
              future. Attempting to fix these performance problems often takes
              over two weeks and doesn't account for the additional time
              required for maintenance. Furthermore, different features might
              need to use various templates, formats, and methods for generating
              files, which adds further complexity to the codebase.
            </p>
            <p class="my-4">
              We have a similar problem in my current workplace, which inspired
              me to develop this side project. Meanwhile, I want to practice
              some new technologies and learn about GCP. Next, I will share what
              I learned from this project.
            </p>
            <h2 class="text-3xl my-8">Analysis of the problem</h2>
            <p class="my-4">
              This problem can be divided into two sub-issues below:
            </p>
            <h3 class="text-2xl my-4">How to prevent the performance issue?</h3>
            <p class="my-4">
              This issue is all about resource adaptation and whether the logic
              is separated from the main service or not. If not, the number of
              instances will increase or the instance of the service will get
              more cpu and memory. If yes, the logic will be separated.
              Depending on the frequency of use, we can choose to execute the
              logic manually or host it on a server.
            </p>
            <p class="my-4">
              PS. We will only discuss the case of separation logic.
            </p>
            <h3 class="text-2xl my-4">How to reduce the code complexity?</h3>
            <p class="my-4">
              The most straightforward approach is to modularize the logic, but
              we can look at some more details. Regarding file generation, there
              are two inputs, there are two inputs: data and template, which are
              different for different files and also have their code(fetching
              data and the templates' contents). Other pieces of code, except
              inputs, are very similar and can be unified into the same form, so
              they are ignored here. Then we can consider if the module contains
              the code of these two inputs.
            </p>
            <p class="my-4">
              To sum up the above analysis, we have these four types of modules
              for the solution:
            </p>
            <ol class=" list-decimal px-8">
              <li>
                Template management, which hosts templates and the generation
                process.
              </li>
              <li>
                Internal server, data warehouse service, and report service,
                which hosts data and templates and the generation process.
              </li>
              <li>
                Internal template library, which only hosts the generation
                process.
              </li>
              <li>
                Niche file generation service, which hosts data and the
                generation process.{" "}
                <p>
                  The file generation might be a part of the main business in
                  this case. The template is more varied than the data. (ex:
                  resume builder, etc)
                </p>
              </li>
            </ol>
            <p class="my-4">
              The first two types will be discussed in this article. The scope
              of the third type is too small and the scenario of the fourth is
              too niche.
            </p>
            <h2 class="text-3xl my-8">Implementation Plan</h2>
            <p class="my-4">
              This project serves as a prototype for the first type of module,
              which includes the public API, template management, webhook
              settings, and basic login functionality. It is a Full-stack
              project. The front-end stack includes typescript, solidjs,
              solid-ui, tailwind and Vercel. The back-end stack is based on
              Firebase and GCP service. Below are pictures of the project's
              architecture. You can explore these features on this website and
              check the repository for more details.
            </p>
            <figure class="my-4">
              <img class="my-4" src="/overall-arch.svg" />
              <figcaption>Fig.1 - Overall Architecture</figcaption>
            </figure>
            <p class="my-4">
              The prototype is designed as a SAAS, so its architecture is more
              complex than that of an internal service. The sandbox is
              particularly added to make the service more flexible. The
              architecture can add more sandboxes for different languages and
              libraries.
            </p>
            <h2 class="text-3xl my-8">Future development</h2>
            <p class="my-4">
              This project is rough and not efficient currently. Below I listed
              some points to improve efficiency:
            </p>
            <h3 class="text-2xl my-4">Template</h3>
            <p class="my-4">
              Since the first supported template library requires templates in
              tsx or jsx, they must be transpiled to js in order to be executed.
              This inspired me to preprocess the template to improve
              performance. For example, js code can be compiled into WASM.
            </p>
            <h3 class="text-2xl my-4">Sandbox</h3>
            <p class="my-4">
              If this project supports different languages and versions, it will
              open multiple sandboxes for running templates. However it does not
              have to open those sandboxes in the first place, it can open the
              related sandbox when a user adds the template that asks for the
              language.
            </p>
            <h3 class="text-2xl my-4">Download</h3>
            <p class="my-4">
              Currently, the way to get the output file is like below. But if we
              consider more about how users use this service, we can find there
              is a common component behind the user's server, that is the client
              side.
            </p>
            <figure class="my-4">
              <img class="my-4" src="/process-1.svg" />
              <figcaption>Fig.2 - Current file generation process</figcaption>
            </figure>
            <figure class="my-4">
              <img class="my-4" src="/component-behind-server.svg" />
              <figcaption>Fig.3 - User's client</figcaption>
            </figure>
            <p class="my-4">
              If the destination of the output file for the user is their client
              side, the service can directly communicate with the client side
              without going through the user's backend side. For the idea, the
              service needs to provide a library to get the file stream by
              WebRTC (for the best efficiency).
            </p>
            <figure class="my-4">
              <img class="my-4" src="/web-rtc-module.svg" />
              <figcaption>Fig.4 - Client side module</figcaption>
            </figure>
            <h3 class="text-2xl my-4">Internal server</h3>
            <p class="my-4">
              The current system is too complex and slow for an internal
              service. Many parts of the system can be taken away. Below is a
              brief image of the new architecture:
            </p>
            <figure class="my-4">
              <img class="my-4" src="/internal-arch.svg" />
              <figcaption>Fig.5 - Internal Architecture</figcaption>
            </figure>
            <p class="my-4">
              The new arch can omit the frontend ui and the sandbox part and the
              check server can be handled by the internal infrastructure.
            </p>
            <figure class="my-4">
              <img class="my-4" src="/saved-space.svg" />
              <figcaption>Fig.6 - Omitted components</figcaption>
            </figure>
          </div>
        </main>
      </div>
    </div>
  );
}
