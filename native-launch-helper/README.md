# Nexus Native Launch Helper

Launches real local Minecraft instances from the MinecraftVersions folder with a single command.

## Quick Setup

Run the setup assistant from the `native-launch-helper` directory:

```bash
node setup-helper.js
```

That's it! The assistant will:
- ✓ Auto-detect your launcher (Prism, MultiMC, etc.)
- ✓ Create config.json with your settings
- ✓ Register the nexus-launcher:// protocol on your system

## How It Works

When you click "Launch Local Instance" in Nexus Engines Lab:

1. **Nexus** generates `nexus-launcher://minecraft-instance?folder=1.21.11&...`
2. **Your OS** sees this URL and invokes the protocol handler
3. **Protocol Handler** reads your config and launcher command
4. **Launcher** opens Minecraft with the selected instance

✓ Real local Minecraft instance opens  
✓ Multiplayer works normally  
✓ No browser sandbox limitations

## Customization

Edit `config.json` to adjust:

```json
{
  "projectRoot": "/path/to/Nexus-Community-Project",
  "launchCommandTemplate": "prismlauncher -l \"{instanceName}\"",
  "workingDirectory": null
}
```

### Available Placeholders

- `{instanceName}` — Version/folder name (e.g., "1.21.11")
- `{instanceFolder}` — Folder name only (e.g., "1.21.11")
- `{instancePath}` — Full path to instance folder
- `{version}` — Game version from manifest
- `{loader}` — Mod loader (fabric, forge, etc.)

## Troubleshooting

**"config.json not found"**
- Run `setup-helper.js` again

**Launcher didn't open**
- Check `config.json` launchCommandTemplate is correct
- Verify instance folder exists in MinecraftVersions/
- Test the command manually in your terminal

**Protocol not recognized**
- Run `setup-helper.js` and choose to register the protocol
- Restart your browser/system if needed
