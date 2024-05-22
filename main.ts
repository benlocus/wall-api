import { Application, Context, Router } from "https://deno.land/x/oak/mod.ts";

const router = new Router();
router
  .get("/", (context) => {
    context.response.body = "Hello world!";
  })
  .post("/slack/task", async (context) => {
    const body = await context.request.body.json();
    console.log(body);
    context.response.body = context.request;
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
