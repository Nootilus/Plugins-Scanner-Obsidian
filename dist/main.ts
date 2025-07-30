import { Plugin, Notice, TFile } from "obsidian";

export default class ListActivePluginsPlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: "list-active-plugins",
      name: "Plugins scanner: scan and create list",
      callback: () => this.createPluginListNote()
    });
  }

  async createPluginListNote() {
    const pluginData = (this.app as any).plugins.plugins;
    const pluginManifests = (this.app as any).plugins.manifests;

    const pluginInfos = Object.keys(pluginData)
      .map(pluginId => {
        const manifest = pluginManifests[pluginId];
        if (!manifest) return null;

        const name = manifest.name || pluginId;
        const version = manifest.version || "??";
        const repoUrl = manifest.authorUrl || manifest.website || (manifest.repo
          ? `https://github.com/${manifest.repo}`
          : null);

        return {
          name,
          version,
          link: repoUrl ? ` – [Check GitHub repo] (${repoUrl})` : ""
        };
      })
      .filter((info): info is { name: string; version: string; link: string } => info !== null)
      .sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));

    const lines = pluginInfos.map(info => `- **${info.name}** (${info.version})${info.link}`);

    const content = `# Active plugins list from this vault\n\n${lines.join("\n")}`;

    const fileName = "active-plugins-list.md";
    const existingFile = this.app.vault.getAbstractFileByPath(fileName);

    if (existingFile instanceof TFile) {
      await this.app.vault.modify(existingFile, content);
    } else {
      await this.app.vault.create(fileName, content);
    }

    new Notice("Active plugins list created.");
  }
}
