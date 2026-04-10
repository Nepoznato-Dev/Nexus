package org.lwjgl.opengl;

import java.nio.ByteBuffer;

public final class ARBVertexBufferObject {
    private ARBVertexBufferObject() {
    }

    public static int glGenBuffersARB() {
        return GL15.glGenBuffers();
    }

    public static void glBindBufferARB(int target, int buffer) {
        GL15.glBindBuffer(target, buffer);
    }

    public static void glBufferDataARB(int target, ByteBuffer data, int usage) {
        GL15.glBufferData(target, data, usage);
    }

    public static void glDeleteBuffersARB(int buffer) {
        GL15.glDeleteBuffers(buffer);
    }
}