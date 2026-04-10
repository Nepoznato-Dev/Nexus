package org.lwjgl.util.vector;

public class Vector3f {
    public float x;
    public float y;
    public float z;

    public Vector3f() {
        this(0.0F, 0.0F, 0.0F);
    }

    public Vector3f(float x, float y, float z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public Vector3f(Vector3f other) {
        this(other.x, other.y, other.z);
    }

    public void set(float x, float y, float z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public void scale(float factor) {
        x *= factor;
        y *= factor;
        z *= factor;
    }

    public static Vector3f add(Vector3f left, Vector3f right, Vector3f dest) {
        Vector3f out = dest == null ? new Vector3f() : dest;
        out.set(left.x + right.x, left.y + right.y, left.z + right.z);
        return out;
    }

    public static Vector3f sub(Vector3f left, Vector3f right, Vector3f dest) {
        Vector3f out = dest == null ? new Vector3f() : dest;
        out.set(left.x - right.x, left.y - right.y, left.z - right.z);
        return out;
    }

    public static Vector3f cross(Vector3f left, Vector3f right, Vector3f dest) {
        Vector3f out = dest == null ? new Vector3f() : dest;
        out.set(
                left.y * right.z - left.z * right.y,
                left.z * right.x - left.x * right.z,
                left.x * right.y - left.y * right.x);
        return out;
    }

    public static float dot(Vector3f left, Vector3f right) {
        return left.x * right.x + left.y * right.y + left.z * right.z;
    }
}