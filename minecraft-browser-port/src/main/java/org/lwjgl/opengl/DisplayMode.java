package org.lwjgl.opengl;

import java.util.Objects;

public class DisplayMode {
    private final int width;
    private final int height;
    private final int bitsPerPixel;
    private final int frequency;

    public DisplayMode(int width, int height) {
        this(width, height, 32, 60);
    }

    public DisplayMode(int width, int height, int bitsPerPixel) {
        this(width, height, bitsPerPixel, 60);
    }

    public DisplayMode(int width, int height, int bitsPerPixel, int frequency) {
        this.width = width;
        this.height = height;
        this.bitsPerPixel = bitsPerPixel;
        this.frequency = frequency;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public int getBitsPerPixel() {
        return bitsPerPixel;
    }

    public int getFrequency() {
        return frequency;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof DisplayMode)) {
            return false;
        }
        DisplayMode mode = (DisplayMode) other;
        return width == mode.width && height == mode.height && bitsPerPixel == mode.bitsPerPixel
                && frequency == mode.frequency;
    }

    @Override
    public int hashCode() {
        return Objects.hash(width, height, bitsPerPixel, frequency);
    }
}