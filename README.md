# 🛠️ Available Remote MCP Tools

These are the tools you can use from Claude Desktop or any MCP client:

- **get_country_info**: Get detailed information about a country.
- **get_countries_by_region**: List top countries in a region by population.
- **get_currency_info**: Show which countries use a specific currency.
- **compare_countries**: Compare two countries (population, area, region, etc).
- **search_countries**: Search countries by name, capital, or region.

Each tool accepts specific parameters. See `EXAMPLES.md` for detailed usage examples.

## Connect Claude Desktop with this MCP server

To connect this MCP server to your Claude Desktop, follow [Anthropic's Quickstart](https://modelcontextprotocol.io/quickstart/user) and within Claude Desktop go to Settings > Developer > Edit Config.

Update with this configuration:

```json
{
  "mcpServers": {
    "countries-info": {
      "command": "npx",
      "args": [
        "mcp-remote", 
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
