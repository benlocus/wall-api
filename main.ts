import { Application, Context, Router } from "https://deno.land/x/oak/mod.ts";

const BASE_ID = Deno.env.get("BASE_ID");
const TEAM_TABLE_ID = Deno.env.get("TEAM_TABLE_ID");
const TASK_TABLE_ID = Deno.env.get("TASK_TABLE_ID");
const AIRTABLE_TOKEN = Deno.env.get("AIRTABLE_TOKEN");
const router = new Router();
router.get("/", (context) => {
  context.response.body = "Hello world!";
}).post("/slack/task", async (context) => {
  const formData = await context.request.body.formData();
  console.log(context.request);
  console.log(formData);
  const rawText = formData.get("text") as string;
  const channel = formData.get("channel_name") as string;

  // extract the name and the task
  const text = extractTask(rawText.trim()) as Array<string>;

  const [_, name, task] = text;

  console.log("Name: ", name);
  console.log("Task: ", task);

  const response = await postTask(name, task, channel);

  // return a response
  const slackResponse = {
    response_type: "in_channel",
    text: response,
  };
  context.response.headers.set("Content-Type", "application/json");
  context.response.body = JSON.stringify(slackResponse);
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

async function aliasToMember(alias: string) {
  const { records } = await getTeam();
  for (const member of records) {
    if (alias.toLowerCase() === member.fields.Alias.toLowerCase()) {
      return member;
    }
  }
  return null;
}

async function postTask(name: string, task: string, channel: string) {
  const user = await aliasToMember(name);
  const userId = user.fields.User.id;

  const taskObject = {
    "Executing": userId,
    "Task": task,
    "Notes": `Via Slack from channel: ${channel}`,
  };

  console.log(taskObject);

  const taskJson = JSON.stringify({ "fields": taskObject, typecast: true });

  console.log(taskJson);

  const response = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${TASK_TABLE_ID}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: taskJson,
    },
  );

  console.log(response);

  return `New task for *${user.fields.User.name}*: ${task}`;
}
