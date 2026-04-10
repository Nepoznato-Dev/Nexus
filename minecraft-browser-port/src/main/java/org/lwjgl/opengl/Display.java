package org.lwjgl.opengl;

import java.nio.ByteBuffer;
import org.lwjgl.LWJGLException;

public final class Display {
    private static boolean created;
    private static boolean fullscreen;
    private static boolean vsync;
    private static boolean resizable;
    private static boolean active = true;
    private static boolean resized;
    private static String title = "Minecraft";
    private static DisplayMode displayMode = new DisplayMode(854, 480);

    private Display() {
    }

    public static void setResizable(boolean value) {
        resizable = value;
    }

    public static boolean isResizable() {
        return resizable;
    }

    public static void setTitle(String value) {
        title = value;
    }

    public static String getTitle() {
        return title;
    }

    public static void create() throws LWJGLException {
        created = true;
    }

    public static void create(PixelFormat pixelFormat) throws LWJGLException {
        created = true;
    }

    public static void destroy() {
        created = false;
        active = false;
    }

    public static boolean isCreated() {
        return created;
    }

    public static void setDisplayMode(DisplayMode mode) throws LWJGLException {
        resized = displayMode.getWidth() != mode.getWidth() || displayMode.getHeight() != mode.getHeight();
        displayMode = mode;
    }

    public static DisplayMode getDisplayMode() {
        return displayMode;
    }

    public static DisplayMode getDesktopDisplayMode() {
        return new DisplayMode(1280, 720);
    }

    public static DisplayMode[] getAvailableDisplayModes() throws LWJGLException {
        return new DisplayMode[] { new DisplayMode(854, 480), new DisplayMode(1280, 720) };
    }

    public static void setFullscreen(boolean value) throws LWJGLException {
        fullscreen = value;
        active = true;
    }

    public static boolean isFullscreen() {
        return fullscreen;
    }

    public static void setVSyncEnabled(boolean value) {
        vsync = value;
    }

    public static boolean isVSyncEnabled() {
        return vsync;
    }

    public static void setIcon(ByteBuffer[] icons) {
    }

    public static void update() {
        resized = false;
    }

    public static void sync(int fps) {
    }

    public static boolean isCloseRequested() {
        return false;
    }

    public static boolean wasResized() {
        return resized;
    }

    public static int getWidth() {
        return displayMode.getWidth();
    }

    public static int getHeight() {
        return displayMode.getHeight();
    }

    public static boolean isActive() {
        return active;
    }
}