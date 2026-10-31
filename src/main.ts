import open from "open";
import { Flow } from "./lib/flow";
import { z } from "zod";

const providers = [
	{
		name: "DeepSeek",
		urlSetting: "deepseekUrl",
		defaultUrl: "https://chat.deepseek.com/?q={query}",
	},
	{
		name: "ChatGPT",
		urlSetting: "chatGptUrl",
		defaultUrl: "https://chatgpt.com/?q={query}",
	},
	{
		name: "Gemini",
		urlSetting: "geminiUrl",
		defaultUrl: "https://gemini.google.com/app?q={query}",
	},
	{
		name: "Claude",
		urlSetting: "claudeUrl",
		defaultUrl: "https://claude.ai/new?q={query}",
	},
	{
		name: "Perplexity",
		urlSetting: "perplexityUrl",
		defaultUrl: "https://www.perplexity.ai/search?q={query}",
	},
	{
		name: "Custom",
		urlSetting: "customUrl",
		defaultUrl: "https://example.com/?q={query}",
	},
] as const;

const events = ["open"] as const;
type Events = (typeof events)[number];

const settingsSchema = z.object({
	provider: z.string().optional(),
	deepseekUrl: z.string().optional(),
	chatGptUrl: z.string().optional(),
	geminiUrl: z.string().optional(),
	claudeUrl: z.string().optional(),
	perplexityUrl: z.string().optional(),
	customUrl: z.string().optional(),
});

const flow = new Flow<Events>("assets/hugeicons_ai-search.png");

function getErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function makeProviderUrl(template: string, prompt: string): string {
	if (!template.includes("{query}")) {
		throw new Error("URL template must contain {query} where the prompt should go.");
	}

	const url = new URL(template.replace(/\{query\}/g, () => encodeURIComponent(prompt)));
	if (url.protocol !== "https:" && url.protocol !== "http:") {
		throw new Error("URL must use http or https.");
	}

	return url.toString();
}

flow.on("query", (params) => {
	const [query] = z.array(z.string()).parse(params);
	const prompt = query?.trim();

	if (!prompt) {
		flow.showResult({
			title: "Введите запрос после префикса ai",
			subtitle: "Например: ai объясни квантовую физику простыми словами",
		});
		return;
	}

	const parsedSettings = settingsSchema.safeParse(flow.settings ?? {});
	if (!parsedSettings.success) {
		flow.log.error("Invalid plugin settings", parsedSettings.error);
		flow.showResult({
			title: "Некорректные настройки плагина",
			subtitle: "Проверьте настройки провайдера и URL.",
		});
		return;
	}

	const providerName = parsedSettings.data.provider ?? "DeepSeek";
	const provider = providers.find(({ name }) => name === providerName);
	if (!provider) {
		flow.showResult({
			title: `Неизвестный AI-провайдер: ${providerName}`,
			subtitle: "Выберите провайдера в настройках плагина.",
		});
		return;
	}

	const template = parsedSettings.data[provider.urlSetting] ?? provider.defaultUrl;
	try {
		const url = makeProviderUrl(template, prompt);
		flow.showResult({
			title: `Спросить ${provider.name}: ${prompt}`,
			subtitle: url,
			method: "open",
			parameters: [url],
		});
	} catch (error) {
		flow.log.error("Invalid provider URL template", error);
		flow.showResult({
			title: "Не удалось создать ссылку",
			subtitle: getErrorMessage(error),
		});
	}
});

flow.on("open", (params) => {
	let url: string;
	try {
		[url] = z.array(z.string().url()).length(1).parse(params);
		const protocol = new URL(url).protocol;
		if (protocol !== "https:" && protocol !== "http:") {
			throw new Error("URL must use http or https.");
		}
	} catch (error) {
		flow.log.error("Invalid URL passed to browser action", error);
		flow.showResult({
			title: "Не удалось открыть ссылку",
			subtitle: getErrorMessage(error),
		});
		return;
	}

	void open(url).catch((error: unknown) => {
		flow.log.error("Failed to open provider URL", error);
		flow.showResult({
			title: "Не удалось открыть браузер",
			subtitle: getErrorMessage(error),
		});
	});
});

flow.run();
