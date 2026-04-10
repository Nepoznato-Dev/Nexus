package org.lwjgl.opengl;

public final class EXTBlendFuncSeparate {
    private EXTBlendFuncSeparate() {
    }

    public static void glBlendFuncSeparateEXT(int srcRGB, int dstRGB, int srcAlpha, int dstAlpha) {
        GL14.glBlendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
    }
}