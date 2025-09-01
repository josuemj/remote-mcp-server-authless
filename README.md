## Connect Claude Desktop with this MCP server

To connect this MCP server to your Claude Desktop, follow [Anthropic's Quickstart](https://modelcontextprotocol.io/quickstart/user) and within Claude Desktop go to Settings > Developer > Edit Config.

Update with this configuration:

```json
{
  "mcpServers": {
    "countries-info": {
      "command": "npx",
      "args": [
        "josuemj-remote-mcp", 
        "https://remote-mcp-server-authless.josuemj456.workers.dev/sse"
      ]
    }
  }
}
```

Restart Claude and you should see the tools become available. 

## Dev
npm start

## Deployment
npx wrangler@latest deploy

## mcp local inspector
npx @modelcontextprotocol/inspector@latest


## Cloudflare mcp playground 
https://playground.ai.cloudflare.com/
