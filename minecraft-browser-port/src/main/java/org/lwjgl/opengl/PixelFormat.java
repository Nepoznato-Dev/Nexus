package org.lwjgl.opengl;

public class PixelFormat {
    private int depthBits = 24;

    public PixelFormat withDepthBits(int value) {
        depthBits = value;
        return this;
    }

    public int getDepthBits() {
        return depthBits;
    }
}