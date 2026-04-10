package org.lwjgl.input;

public final class Mouse {
    private static boolean grabbed;
    private static int cursorX;
    private static int cursorY;

    private Mouse() {
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

    public static int getX() {
        return 0;
    }

    public static int getY() {
        return 0;
    }

    public static int getDX() {
        return 0;
    }

    public static int getDY() {
        return 0;
    }

    public static int getDWheel() {
        return 0;
    }

    public static int getEventButton() {
        return -1;
    }

    public static int getEventX() {
        return cursorX;
    }

    public static int getEventY() {
        return cursorY;
    }

    public static int getEventDWheel() {
        return 0;
    }

    public static boolean getEventButtonState() {
        return false;
    }

    public static boolean isButtonDown(int button) {
        return false;
    }

    public static void setGrabbed(boolean value) {
        grabbed = value;
    }

    public static boolean isGrabbed() {
        return grabbed;
    }

    public static void setCursorPosition(int x, int y) {
        cursorX = x;
        cursorY = y;
    }

    public static boolean isInsideWindow() {
        return true;
    }
}