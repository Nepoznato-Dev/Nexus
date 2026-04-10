package org.lwjgl.opengl;

public final class ARBVertexShader {
    private ARBVertexShader() {
    }

    public static int glGetAttribLocationARB(int program, CharSequence name) {
        return GL20.glGetAttribLocation(program, name);
    }
}