package org.lwjgl.opengl;

public final class GL30 {
    private static int nextFramebufferId = 1;
    private static int nextRenderbufferId = 1;

    private GL30() {
    }

    public static void glBindFramebuffer(int target, int framebuffer) {
    }

    public static void glBindRenderbuffer(int target, int renderbuffer) {
    }

    public static void glDeleteRenderbuffers(int renderbuffer) {
    }

    public static void glDeleteFramebuffers(int framebuffer) {
    }

    public static int glGenFramebuffers() {
        return nextFramebufferId++;
    }

    public static int glGenRenderbuffers() {
        return nextRenderbufferId++;
    }

    public static void glRenderbufferStorage(int target, int internalFormat, int width, int height) {
    }

    public static void glFramebufferRenderbuffer(int target, int attachment, int renderbufferTarget, int renderbuffer) {
    }

    public static int glCheckFramebufferStatus(int target) {
        return 36053;
    }

    public static void glFramebufferTexture2D(int target, int attachment, int textarget, int texture, int level) {
    }
}