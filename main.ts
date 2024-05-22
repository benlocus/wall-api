import { Application, Context, Router } from "https://deno.land/x/oak/mod.ts";

const BASE_ID = Deno.env.get("BASE_ID");
const TEAM_TABLE_ID = Deno.env.get("TEAM_TABLE_ID");
const AIRTABLE_TOKEN = Deno.env.get("AIRTABLE_TOKEN");

const router = new Router();
router
  .get("/", (context) => {
    context.response.body = "Hello world!";
  })
  .post("/slack/task", async (context) => {
    const formData = await context.request.body.formData();
    console.log(context.request);
    console.log(formData);

    const rawText = formData.get("text") as string;
    const channel = formData.get("channel") as string;

    // extract the name and the task
    const text = extractTask(rawText.trim()) as Array<string>;

    const [_, name, task] = text;

    console.log("Name: ", name);
    console.log("Task: ", task);

    const team = getTeam();

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

async function getTeam() {
  const response = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${TEAM_TABLE_ID}?fields[]=Name&fields[]=User&fields[]=Alias`,
    {
      headers: {
        "Authorization": `Bearer ${AIRTABLE_TOKEN}`,
      },
    },
  );
  const team = await response.json();
  console.log(team);
  return team;
}
