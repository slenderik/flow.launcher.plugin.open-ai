# Ask AI for Flow Launcher

Enter `ai` followed by a prompt to open it in your selected AI provider. For example:

```text
ai объясни квантовую физику простыми словами
```

The prompt is URL-encoded and inserted where `{query}` appears in the provider URL.

## Settings

Open Flow Launcher's plugin settings for **Ask AI** to choose a provider and edit its URL template. DeepSeek is selected by default. Available providers are DeepSeek, ChatGPT, Gemini, Claude, Perplexity, and Custom.

Use `{query}` in a URL template to mark where the prompt should be inserted. For example:

```text
https://chat.deepseek.com/?q={query}
```

## Development

To test this plugin, create a symlink between this directory and the plugin directory from Flow Launcher. Search for `Flow Launcher UserData Folder` in the launcher and open the `Plugins` folder.

Create a symlink by opening Command Prompt (CMD) and typing:

```CMD
mklink /J [flow-launcher-plugin-folder]/[folder-name] [project-root]
```

An example would look like this:

```CMD
mklink /J C:\Users\Joel\AppData\Roaming\FlowLauncher\Plugins\flow-plugin C:\Users\Joel\code\flow-plugin
```

After this is set up. You can run:

```bash
npm install
npm run dev
```

To compile the code and then **restart** Flow Launcher and the plugin should be loaded.

> **Note**
>
> You **don't** need to restart Flow Launcher every time you make a change.

## Publishing

When you want to release and publish a new version, just push to the `main` branch and it wil automatically create a new release and tag with the correct versions.

To add the plugin to the official Flow Launcher plugin manifest, follow [this](https://github.com/Flow-Launcher/Flow.Launcher.PluginsManifest#readme) guide.
