package org.lwjgl.opengl;

import java.nio.ByteBuffer;

public final class GL15 {
    private static int nextBufferId = 1;

    private GL15() {
    }

    public static int glGenBuffers() {
        return nextBufferId++;
    }

    public static void glBindBuffer(int target, int buffer) {
    }

    public static void glBufferData(int target, ByteBuffer data, int usage) {
    }

    public static void glDeleteBuffers(int buffer) {
    }
}