package net.minecraft.client.main;

import dev.nexus.minecraft.browser.BrowserPortBootstrap;

public final class Main {
    private Main() {
    }

    public static void main(String[] args) {
        BrowserPortBootstrap.launchFromMinecraftMain(args);
    }
}