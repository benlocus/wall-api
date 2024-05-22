import { Application, Context, Router } from "https://deno.land/x/oak/mod.ts";

const router = new Router();
router
  .get("/", (context) => {
    context.response.body = "Hello world!";
  })
  .post("/slack/task", async (context) => {
    const formData = await context.request.body.formData();
    const rawText = formData.get("text") as string;

    // logging for testing
    console.log(context.request);
    console.log(rawText);

    // extract the name and the task
    const text = extractTask(rawText.trim());
    console.log(text);

    // return a response
    context.response.body = text;
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });

// utility
function extractTask(text: string) {
  const regex = /^(\w+)\s(...*)/gm;
  const valuesArray = regex.exec(text);
  return valuesArray;
}
