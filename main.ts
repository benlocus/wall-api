import { Application, Context, Router } from "https://deno.land/x/oak/mod.ts";

const router = new Router();
router
  .get("/", (context) => {
    context.response.body = "Hello world!";
  })
  .post("/slack/task", async (context) => {
    const formData = await context.request.body.formData();
    const text = formData.get("text");
    console.log(context.request);
    console.log(text);
    context.response.body = text;
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
