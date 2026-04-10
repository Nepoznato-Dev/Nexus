package dev.nexus.minecraft.browser;

public final class BrowserPortBootstrap {
    private BrowserPortBootstrap() {
    }

    public static void main(String[] args) {
        launchFromMinecraftMain(args);
    }

    public static void launchFromMinecraftMain(String[] args) {
        BrowserLaunchConfig config = BrowserArgumentParser.parse(args);
        System.out.println("Nexus Minecraft browser-port bootstrap initialized.");
        System.out.println("Version: " + config.version());
        System.out.println("Player: " + config.username());
        System.out.println("Display: " + config.width() + "x" + config.height()
                + (config.fullscreen() ? " fullscreen" : " windowed"));
    }
}