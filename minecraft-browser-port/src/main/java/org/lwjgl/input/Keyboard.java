package org.lwjgl.input;

public final class Keyboard {
    private static boolean repeatEvents;

    private Keyboard() {
    }

    public static void create() {
    }

    public static void destroy() {
    }

    public static boolean isCreated() {
        return true;
    }

    public static boolean next() {
        return false;
    }

    public static int getEventKey() {
        return 0;
    }

    public static char getEventCharacter() {
        return 0;
    }

    public static boolean getEventKeyState() {
        return false;
    }

    public static boolean isRepeatEvent() {
        return false;
    }

    public static boolean isKeyDown(int key) {
        return false;
    }

    public static void enableRepeatEvents(boolean enabled) {
        repeatEvents = enabled;
    }

    public static boolean areRepeatEventsEnabled() {
        return repeatEvents;
    }

    public static String getKeyName(int key) {
        if (key <= 0) {
            return "NONE";
        }

        return "KEY_" + key;
    }
}