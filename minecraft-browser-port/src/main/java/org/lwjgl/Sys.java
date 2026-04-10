package org.lwjgl;

public final class Sys {
    private Sys() {
    }

    public static String getVersion() {
        return "NexusBrowserShim-0.1";
    }

    public static long getTime() {
        return System.currentTimeMillis();
    }

    public static long getTimerResolution() {
        return 1000L;
    }

    public static boolean openURL(String url) {
        return true;
    }
}