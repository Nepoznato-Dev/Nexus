package dev.nexus.minecraft.browser;

import java.util.HashMap;
import java.util.Map;

public final class BrowserArgumentParser {
    private BrowserArgumentParser() {
    }

    public static BrowserLaunchConfig parse(String[] args) {
        Map<String, String> options = new HashMap<>();
        boolean demo = false;
        boolean fullscreen = false;
        boolean checkGlErrors = false;

        for (int index = 0; index < args.length; index++) {
            String raw = args[index];
            if (!raw.startsWith("--")) {
                continue;
            }

            String key = raw.substring(2);
            if (isFlag(key)) {
                if ("demo".equals(key)) {
                    demo = true;
                } else if ("fullscreen".equals(key)) {
                    fullscreen = true;
                } else if ("checkGlErrors".equals(key)) {
                    checkGlErrors = true;
                }
                continue;
            }

            if (index + 1 < args.length) {
                options.put(key, args[++index]);
            }
        }

        String username = options.getOrDefault("username", "PlayerBrowser");
        String uuid = options.getOrDefault("uuid", username);
        String version = options.getOrDefault("version", "1.12.2");
        String accessToken = options.getOrDefault("accessToken", "browser-access-token");
        int width = parseInt(options.get("width"), 854);
        int height = parseInt(options.get("height"), 480);
        int port = parseInt(options.get("port"), 25565);

        return new BrowserLaunchConfig(
                demo,
                fullscreen,
                checkGlErrors,
                width,
                height,
                username,
                uuid,
                version,
                accessToken,
                options.getOrDefault("gameDir", "."),
                options.getOrDefault("assetsDir", "./assets"),
                options.getOrDefault("resourcePackDir", "./resourcepacks"),
                options.get("assetIndex"),
                options.getOrDefault("versionType", "release"),
                options.get("server"),
                port);
    }

    private static boolean isFlag(String key) {
        return "demo".equals(key) || "fullscreen".equals(key) || "checkGlErrors".equals(key);
    }

    private static int parseInt(String value, int fallback) {
        if (value == null || value.isEmpty()) {
            return fallback;
        }

        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ignored) {
            return fallback;
        }
    }
}