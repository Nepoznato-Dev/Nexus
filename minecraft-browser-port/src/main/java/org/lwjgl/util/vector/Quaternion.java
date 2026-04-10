package org.lwjgl.util.vector;

public class Quaternion {
    public float x;
    public float y;
    public float z;
    public float w;

    public Quaternion() {
        this(0.0F, 0.0F, 0.0F, 1.0F);
    }

    public Quaternion(float x, float y, float z, float w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}