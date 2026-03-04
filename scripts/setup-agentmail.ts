import { AgentMailClient } from "agentmail";

const client = new AgentMailClient({
  apiKey: process.env.AGENTMAIL_API_KEY!,
});

async function main() {
  const inbox = await client.inboxes.create({
    username: "internship-tracker",
    clientId: "internship-tracker-inbox",
  });
  console.log("Inbox:", inbox.inboxId);

  const webhookUrl =
    process.env.WEBHOOK_URL ??
    "https://your-app.vercel.app/api/webhook/agentmail";
  await client.webhooks.create({
    url: webhookUrl,
    eventTypes: ["message.received"],
    clientId: "internship-tracker-webhook",
  });
  console.log("Webhook created. Forward emails to:", inbox.inboxId);
}

main().catch(console.error);
