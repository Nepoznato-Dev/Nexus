package org.lwjgl.util.vector;

public class Vector4f {
    public float x;
    public float y;
    public float z;
    public float w;

    public Vector4f() {
        this(0.0F, 0.0F, 0.0F, 0.0F);
    }

    public Vector4f(float x, float y, float z, float w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}