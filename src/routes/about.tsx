import { Title } from "@solidjs/meta";
import Nav from "~/components/Nav";

export default function About() {
  return (
    <div class="flex flex-col h-svh">
      <Nav />

      <div class="flex-1 space-y-4 p-8 pt-6">
        <main class="mx-auto text-gray-700 p-4">
          <Title>About</Title>

          <div class="mx-auto max-w-3xl">
            <h1 class="max-6-xs text-4xl text-sky-700 my-16 text-center">
              A File Generation Service Prototype for Multiple Templates and
              Runtimes
            </h1>

            <h2 class="text-3xl my-8">Introduction</h2>

            <p class="my-4">
              Many software products need to generate files such as reports,
              PDFs, or documents, even when file generation is not part of the
              core business.
            </p>

            <p class="my-4">
              When file-generation logic stays inside the main application, it
              can create two problems over time.
            </p>

            <p class="my-4">
              The first is performance. File generation may require a large
              amount of CPU or memory, and heavy jobs can affect the normal
              workload of the main service.
            </p>

            <p class="my-4">
              The second is code complexity. Different features may require
              different templates, formats, libraries, and ways to prepare data.
              As more use cases are added, the implementation can become harder
              to maintain.
            </p>

            <p class="my-4">
              We had a similar problem at my workplace, which inspired me to
              explore whether file generation could be separated into a reusable
              service.
            </p>

            <p class="my-4">
              I also used this project as a way to practice new technologies and
              learn more about GCP.
            </p>

            <h2 class="text-3xl my-8">Problem Analysis</h2>

            <p class="my-4">
              I divided the problem into two main questions.
            </p>

            <h3 class="text-2xl my-4">
              How can file-generation workloads be isolated?
            </h3>

            <p class="my-4">
              If file generation runs inside the main application, the
              application may need larger instances or more instances to support
              occasional CPU- and memory-heavy workloads.
            </p>

            <p class="my-4">
              Another approach is to separate the generation logic from the main
              service.
            </p>

            <p class="my-4">
              Depending on how often it is used, the separated workload could
              be executed manually, hosted as an independent service, or scaled
              separately from the main application.
            </p>

            <p class="my-4">
              For this project, I focused on the case where file-generation
              logic is separated.
            </p>

            <h3 class="text-2xl my-4">
              How can the code complexity be reduced?
            </h3>

            <p class="my-4">
              Most file-generation workflows have two parts that change between
              use cases:
            </p>

            <ul class="list-disc px-8 my-4">
              <li>Data</li>
              <li>Template</li>
            </ul>

            <p class="my-4">
              Each file may have different logic for preparing its data and
              defining its template.
            </p>

            <p class="my-4">
              The rest of the workflow is usually similar: receive the inputs,
              execute the generation process, and return the generated file.
            </p>

            <p class="my-4">
              Based on where the data, templates, and generation logic are
              placed, I identified four possible approaches:
            </p>

            <ol class="list-decimal px-8 space-y-3">
              <li>
                <strong>Template management service</strong>
                <p>Hosts templates and the generation process.</p>
              </li>

              <li>
                <strong>Internal report or data service</strong>
                <p>
                  Hosts the data, templates, and generation process together.
                </p>
              </li>

              <li>
                <strong>Internal template library</strong>
                <p>
                  Provides reusable generation logic inside an existing system.
                </p>
              </li>

              <li>
                <strong>Domain-specific file-generation service</strong>
                <p>
                  Hosts the data and generation process while allowing users to
                  provide or customize templates. A resume builder is one
                  example.
                </p>
              </li>
            </ol>

            <p class="my-4">
              This project mainly explores the first approach.
            </p>

            <p class="my-4">
              The third approach is relatively small in scope, while the fourth
              is more suitable when file generation itself is part of the main
              product.
            </p>

            <h2 class="text-3xl my-8">Implementation Plan</h2>

            <p class="my-4">
              Easy File Gen is a prototype of a standalone file-generation
              service.
            </p>

            <p class="my-4">The current prototype includes:</p>

            <ul class="list-disc px-8 my-4">
              <li>Public API</li>
              <li>Template management</li>
              <li>Webhook configuration</li>
              <li>Basic login functionality</li>
              <li>Sandboxed template execution</li>
            </ul>

            <p class="my-4">
              It is implemented as a full-stack project.
            </p>

            <h3 class="text-2xl my-4">Frontend</h3>

            <ul class="list-disc px-8 my-4">
              <li>TypeScript</li>
              <li>SolidJS</li>
              <li>Solid UI</li>
              <li>Tailwind CSS</li>
              <li>Vercel</li>
            </ul>

            <h3 class="text-2xl my-4">Backend</h3>

            <ul class="list-disc px-8 my-4">
              <li>Firebase</li>
              <li>Google Cloud Platform</li>
            </ul>

            <p class="my-4">
              The overall architecture is shown below.
            </p>

            <figure class="my-4">
              <img
                class="my-4"
                src="/overall-arch.svg"
                alt="Overall architecture"
              />
              <figcaption>Fig.1 - Overall Architecture</figcaption>
            </figure>

            <p class="my-4">
              The prototype is designed as a SaaS product, so the architecture
              is intentionally more complex than what would be required for an
              internal service.
            </p>

            <p class="my-4">
              One important part of the design is the sandbox layer.
            </p>

            <p class="my-4">
              The sandbox separates template execution from the main
              application and also makes the architecture more flexible. In the
              future, different sandboxes could support different languages,
              runtime versions, or generation libraries.
            </p>

            <h2 class="text-3xl my-8">Future Development</h2>

            <p class="my-4">
              The current implementation is still a prototype, and there are
              several areas I would like to improve.
            </p>

            <h3 class="text-2xl my-4">Template Processing</h3>

            <p class="my-4">
              The first supported template library uses TSX or JSX templates,
              which need to be transformed into JavaScript before execution.
            </p>

            <p class="my-4">
              Instead of repeating this work every time a file is generated,
              one improvement would be to preprocess the template when it is
              created or updated.
            </p>

            <p class="my-4">
              I would also like to explore whether other execution formats,
              including WebAssembly in some cases, could improve startup or
              execution performance.
            </p>

            <h3 class="text-2xl my-4">Sandbox Management</h3>

            <p class="my-4">
              If the system supports multiple languages or runtime versions, it
              may eventually need several different sandbox environments.
            </p>

            <p class="my-4">
              However, these environments do not all need to run all the time.
              A better approach would be to start or prepare a sandbox only when
              a template requires that specific runtime.
            </p>

            <p class="my-4">
              This could reduce unnecessary resource usage while keeping the
              system flexible.
            </p>

            <h3 class="text-2xl my-4">Download Flow</h3>

            <p class="my-4">
              The current file-generation flow is shown below.
            </p>

            <figure class="my-4">
              <img
                class="my-4"
                src="/process-1.svg"
                alt="Current file generation process"
              />
              <figcaption>
                Fig.2 - Current File Generation Process
              </figcaption>
            </figure>

            <p class="my-4">
              In many applications, the final destination of the generated file
              is the user's browser rather than the application's backend.
            </p>

            <p class="my-4">
              This means there may be an opportunity to remove one unnecessary
              transfer step.
            </p>

            <figure class="my-4">
              <img
                class="my-4"
                src="/component-behind-server.svg"
                alt="User client"
              />
              <figcaption>Fig.3 - User Client</figcaption>
            </figure>

            <p class="my-4">
              Instead of always sending the generated file through the user's
              backend, the file-generation service could communicate more
              directly with the client.
            </p>

            <p class="my-4">
              One possible direction would be to provide a client-side library
              and explore direct streaming mechanisms such as WebRTC.
            </p>

            <figure class="my-4">
              <img
                class="my-4"
                src="/web-rtc-module.svg"
                alt="Client-side module"
              />
              <figcaption>Fig.4 - Client-Side Module</figcaption>
            </figure>

            <p class="my-4">
              This would require additional work around authentication,
              security, connection management, and browser support, but it could
              reduce unnecessary data transfer through the user's server.
            </p>

            <h3 class="text-2xl my-4">Internal Service Architecture</h3>

            <p class="my-4">
              The current architecture is designed for a public SaaS product.
            </p>

            <p class="my-4">
              For an internal company service, many parts of the system would
              not be necessary.
            </p>

            <figure class="my-4">
              <img
                class="my-4"
                src="/internal-arch.svg"
                alt="Internal architecture"
              />
              <figcaption>Fig.5 - Internal Architecture</figcaption>
            </figure>

            <p class="my-4">
              For example, the frontend management UI could be removed if
              templates were managed through internal tools.
            </p>

            <p class="my-4">
              The sandbox layer could also be simplified if the company
              controlled all templates and execution environments.
            </p>

            <p class="my-4">
              Authentication and access control could rely on existing internal
              infrastructure instead of being implemented inside this service.
            </p>

            <figure class="my-4">
              <img
                class="my-4"
                src="/saved-space.svg"
                alt="Components that could be removed"
              />
              <figcaption>Fig.6 - Components That Could Be Removed</figcaption>
            </figure>

            <p class="my-4">
              This would result in a much smaller architecture for internal use.
            </p>

            <p class="my-4">
              The project helped me understand that the same technical problem
              can require very different architectures depending on the
              environment.
            </p>

            <p class="my-4">
              A public SaaS product needs stronger isolation, user management,
              and flexibility. An internal service can often be much simpler
              because it can reuse existing infrastructure and trust boundaries.
            </p>

            <div class="my-10">
              <a
                class="text-sky-700 underline"
                href="https://github.com/gjccing/easy-file-gen"
                target="_blank"
                rel="noopener noreferrer"
              >
                View source code on GitHub
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}