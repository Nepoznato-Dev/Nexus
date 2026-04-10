package org.lwjgl.util.vector;

public class Matrix4f {
    public float m00;
    public float m01;
    public float m02;
    public float m03;
    public float m10;
    public float m11;
    public float m12;
    public float m13;
    public float m20;
    public float m21;
    public float m22;
    public float m23;
    public float m30;
    public float m31;
    public float m32;
    public float m33;

    public Matrix4f() {
        setIdentity();
    }

    public void setIdentity() {
        m00 = 1.0F;
        m01 = 0.0F;
        m02 = 0.0F;
        m03 = 0.0F;
        m10 = 0.0F;
        m11 = 1.0F;
        m12 = 0.0F;
        m13 = 0.0F;
        m20 = 0.0F;
        m21 = 0.0F;
        m22 = 1.0F;
        m23 = 0.0F;
        m30 = 0.0F;
        m31 = 0.0F;
        m32 = 0.0F;
        m33 = 1.0F;
    }

    public static Matrix4f rotate(float angle, Vector3f axis, Matrix4f src, Matrix4f dest) {
        Matrix4f out = dest == null ? new Matrix4f() : dest;
        Matrix4f base = src == null ? new Matrix4f() : src;
        Matrix4f rotation = new Matrix4f();

        float length = (float) Math.sqrt(axis.x * axis.x + axis.y * axis.y + axis.z * axis.z);
        if (length == 0.0F) {
            copy(base, out);
            return out;
        }

        float x = axis.x / length;
        float y = axis.y / length;
        float z = axis.z / length;
        float cos = (float) Math.cos(angle);
        float sin = (float) Math.sin(angle);
        float invCos = 1.0F - cos;

        rotation.m00 = cos + x * x * invCos;
        rotation.m01 = x * y * invCos - z * sin;
        rotation.m02 = x * z * invCos + y * sin;
        rotation.m10 = y * x * invCos + z * sin;
        rotation.m11 = cos + y * y * invCos;
        rotation.m12 = y * z * invCos - x * sin;
        rotation.m20 = z * x * invCos - y * sin;
        rotation.m21 = z * y * invCos + x * sin;
        rotation.m22 = cos + z * z * invCos;
        rotation.m33 = 1.0F;

        return mul(base, rotation, out);
    }

    public static Matrix4f mul(Matrix4f left, Matrix4f right, Matrix4f dest) {
        Matrix4f out = dest == null ? new Matrix4f() : dest;

        float nm00 = left.m00 * right.m00 + left.m10 * right.m01 + left.m20 * right.m02 + left.m30 * right.m03;
        float nm01 = left.m01 * right.m00 + left.m11 * right.m01 + left.m21 * right.m02 + left.m31 * right.m03;
        float nm02 = left.m02 * right.m00 + left.m12 * right.m01 + left.m22 * right.m02 + left.m32 * right.m03;
        float nm03 = left.m03 * right.m00 + left.m13 * right.m01 + left.m23 * right.m02 + left.m33 * right.m03;
        float nm10 = left.m00 * right.m10 + left.m10 * right.m11 + left.m20 * right.m12 + left.m30 * right.m13;
        float nm11 = left.m01 * right.m10 + left.m11 * right.m11 + left.m21 * right.m12 + left.m31 * right.m13;
        float nm12 = left.m02 * right.m10 + left.m12 * right.m11 + left.m22 * right.m12 + left.m32 * right.m13;
        float nm13 = left.m03 * right.m10 + left.m13 * right.m11 + left.m23 * right.m12 + left.m33 * right.m13;
        float nm20 = left.m00 * right.m20 + left.m10 * right.m21 + left.m20 * right.m22 + left.m30 * right.m23;
        float nm21 = left.m01 * right.m20 + left.m11 * right.m21 + left.m21 * right.m22 + left.m31 * right.m23;
        float nm22 = left.m02 * right.m20 + left.m12 * right.m21 + left.m22 * right.m22 + left.m32 * right.m23;
        float nm23 = left.m03 * right.m20 + left.m13 * right.m21 + left.m23 * right.m22 + left.m33 * right.m23;
        float nm30 = left.m00 * right.m30 + left.m10 * right.m31 + left.m20 * right.m32 + left.m30 * right.m33;
        float nm31 = left.m01 * right.m30 + left.m11 * right.m31 + left.m21 * right.m32 + left.m31 * right.m33;
        float nm32 = left.m02 * right.m30 + left.m12 * right.m31 + left.m22 * right.m32 + left.m32 * right.m33;
        float nm33 = left.m03 * right.m30 + left.m13 * right.m31 + left.m23 * right.m32 + left.m33 * right.m33;

        out.m00 = nm00;
        out.m01 = nm01;
        out.m02 = nm02;
        out.m03 = nm03;
        out.m10 = nm10;
        out.m11 = nm11;
        out.m12 = nm12;
        out.m13 = nm13;
        out.m20 = nm20;
        out.m21 = nm21;
        out.m22 = nm22;
        out.m23 = nm23;
        out.m30 = nm30;
        out.m31 = nm31;
        out.m32 = nm32;
        out.m33 = nm33;
        return out;
    }

    public static Vector4f transform(Matrix4f left, Vector4f right, Vector4f dest) {
        Vector4f out = dest == null ? new Vector4f() : dest;
        float x = left.m00 * right.x + left.m10 * right.y + left.m20 * right.z + left.m30 * right.w;
        float y = left.m01 * right.x + left.m11 * right.y + left.m21 * right.z + left.m31 * right.w;
        float z = left.m02 * right.x + left.m12 * right.y + left.m22 * right.z + left.m32 * right.w;
        float w = left.m03 * right.x + left.m13 * right.y + left.m23 * right.z + left.m33 * right.w;
        out.x = x;
        out.y = y;
        out.z = z;
        out.w = w;
        return out;
    }

    private static void copy(Matrix4f src, Matrix4f dest) {
        dest.m00 = src.m00;
        dest.m01 = src.m01;
        dest.m02 = src.m02;
        dest.m03 = src.m03;
        dest.m10 = src.m10;
        dest.m11 = src.m11;
        dest.m12 = src.m12;
        dest.m13 = src.m13;
        dest.m20 = src.m20;
        dest.m21 = src.m21;
        dest.m22 = src.m22;
        dest.m23 = src.m23;
        dest.m30 = src.m30;
        dest.m31 = src.m31;
        dest.m32 = src.m32;
        dest.m33 = src.m33;
    }
}