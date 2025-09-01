import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Calculator & Countries Tools",
		version: "1.0.0",
	});

	async init() {

		// === NEW COUNTRIES TOOLS ===

		// Get country information
		this.server.tool(
			"get_country_info",
			{
				country: z.string().describe("Country name (in English or Spanish)")
			},
			async ({ country }) => {
				try {
					const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`;
					console.log('Fetching:', url);
					
					const response = await fetch(url);
					
					if (!response.ok) {
						throw new Error(`Country not found: ${country}`);
					}
					
					const data = await response.json() as any[];
					const countryData = data[0];
					
					if (!countryData.name || !countryData.name.common) {
						throw new Error('Invalid country data received');
					}
					
					const info = `${countryData.name.common} (${countryData.name.official})

						General Information:
						• Capital: ${countryData.capital?.[0] || 'N/A'}
						• Population: ${countryData.population?.toLocaleString() || 'N/A'}
						• Region: ${countryData.region || 'N/A'}
						• Subregion: ${countryData.subregion || 'N/A'}
						• Area: ${countryData.area?.toLocaleString() || 'N/A'} km²

						Details:
						• Currencies: ${Object.values(countryData.currencies || {}).map((c: any) => `${c.name} (${c.symbol})`).join(', ') || 'N/A'}
						• Languages: ${Object.values(countryData.languages || {}).join(', ') || 'N/A'}
						• Timezone: ${countryData.timezones?.[0] || 'N/A'}
						• Country Code: ${countryData.cca2 || 'N/A'}

						Geography:
						• Borders: ${countryData.borders?.join(', ') || 'No land borders'}
						• Location: ${countryData.latlng?.join(', ') || 'N/A'}`;

					return {
						content: [
							{
								type: "text",
								text: info
							}
						]
					};
				} catch (error) {
					console.error('Error in get_country_info:', error);
					return {
						content: [
							{
								type: "text",
								text: `Error getting country information: ${error instanceof Error ? error.message : 'Unknown error'}`
							}
						]
					};
				}
			}
		);

		// Get currency information
		this.server.tool(
			"get_currency_info",
			{
				currency_code: z.string().describe("Currency code (e.g., USD, EUR, MXN)")
			},
			async ({ currency_code }) => {
				try {
					const url = `https://restcountries.com/v3.1/currency/${currency_code.toUpperCase()}`;
					console.log('Fetching:', url);
					
					const response = await fetch(url);
					
					if (!response.ok) {
						const errorText = await response.text();
						throw new Error(`Currency not found: ${currency_code}`);
					}
					
					const countries = await response.json() as any[];
					console.log('Response data length:', countries.length);
					
					if (!Array.isArray(countries)) {
						throw new Error('Invalid response format: expected array');
					}
					
					const currencyInfo = countries.map(country => {
						const currency = Object.values(country.currencies || {})[0] as any;
						return `${country.name?.common || 'N/A'}: ${currency?.name || 'N/A'} (${currency?.symbol || 'N/A'})`;
					}).join('\n');

					return {
						content: [
							{
								type: "text",
								text: `Countries using ${currency_code.toUpperCase()}:\n\n${currencyInfo}`
							}
						]
					};
				} catch (error) {
					console.error('Error in get_currency_info:', error);
					return {
						content: [
							{
								type: "text",
								text: `Error getting currency information: ${error instanceof Error ? error.message : 'Unknown error'}`
							}
						]
					};
				}
			}
		);

		// Compare two countries
		this.server.tool(
			"compare_countries",
			{
				country1: z.string().describe("First country to compare"),
				country2: z.string().describe("Second country to compare")
			},
			async ({ country1, country2 }) => {
				try {
					console.log('Comparing:', country1, 'vs', country2);
					
					const [response1, response2] = await Promise.all([
						fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country1)}`),
						fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country2)}`)
					]);
					
					if (!response1.ok || !response2.ok) {
						throw new Error('One or both countries were not found');
					}
					
					const [data1, data2] = await Promise.all([
						response1.json(),
						response2.json()
					]) as [any[], any[]];
					
					const c1 = data1[0];
					const c2 = data2[0];
					
					if (!c1?.name?.common || !c2?.name?.common) {
						throw new Error('Invalid country data received');
					}
					
					const comparison = `Comparison: ${c1.name.common} vs ${c2.name.common}

					Population:
					• ${c1.name.common}: ${c1.population?.toLocaleString() || 'N/A'}
					• ${c2.name.common}: ${c2.population?.toLocaleString() || 'N/A'}
					• Difference: ${Math.abs((c1.population || 0) - (c2.population || 0)).toLocaleString()}

					Area:
					• ${c1.name.common}: ${c1.area?.toLocaleString() || 'N/A'} km²
					• ${c2.name.common}: ${c2.area?.toLocaleString() || 'N/A'} km²

					Regions:
					• ${c1.name.common}: ${c1.region || 'N/A'} (${c1.subregion || 'N/A'})
					• ${c2.name.common}: ${c2.region || 'N/A'} (${c2.subregion || 'N/A'})

					Capitals:
					• ${c1.name.common}: ${c1.capital?.[0] || 'N/A'}
					• ${c2.name.common}: ${c2.capital?.[0] || 'N/A'}`;

					return {
						content: [
							{
								type: "text",
								text: comparison
							}
						]
					};
				} catch (error) {
					console.error('Error in compare_countries:', error);
					return {
						content: [
							{
								type: "text",
								text: `Error comparing countries: ${error instanceof Error ? error.message : 'Unknown error'}`
							}
						]
					};
				}
			}
		);

		// Search countries
		this.server.tool(
			"search_countries",
			{
				query: z.string().describe("Search term for countries (name, capital, region, etc.)")
			},
			async ({ query }) => {
				try {
					const searchPromises = [
						fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}`).catch(() => null),
						fetch(`https://restcountries.com/v3.1/capital/${encodeURIComponent(query)}`).catch(() => null)
					];
					
					const responses = await Promise.all(searchPromises);
					let allCountries: any[] = [];
					
					for (const response of responses) {
						if (response && response.ok) {
							const data = await response.json();
							if (Array.isArray(data)) {
								allCountries = [...allCountries, ...data];
							}
						}
					}
					
					// Remove duplicates
					const uniqueCountries = allCountries.filter((country, index, self) => 
						index === self.findIndex(c => c.cca3 === country.cca3)
					);
					
					if (uniqueCountries.length === 0) {
						return {
							content: [
								{
									type: "text",
									text: `No countries found for query: "${query}"`
								}
							]
						};
					}
					
					const results = uniqueCountries.slice(0, 5).map((country: any, index: number) => 
						`${index + 1}. ${country.name?.common || 'N/A'}\n` +
						`   Capital: ${country.capital?.[0] || 'N/A'}\n` +
						`   Region: ${country.region || 'N/A'}\n` +
						`   Population: ${country.population?.toLocaleString() || 'N/A'}`
					).join('\n\n');

					return {
						content: [
							{
								type: "text",
								text: `Search results for "${query}":\n\n${results}`
							}
						]
					};
				} catch (error) {
					console.error('Error in search_countries:', error);
					return {
						content: [
							{
								type: "text",
								text: `Error searching countries: ${error instanceof Error ? error.message : 'Unknown error'}`
							}
						]
					};
				}
			}
		);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};