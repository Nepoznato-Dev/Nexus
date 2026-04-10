package org.lwjgl.opengl;

import java.nio.ByteBuffer;
import java.nio.FloatBuffer;
import java.nio.IntBuffer;

public final class GL11 {
    private static int nextTextureId = 1;
    private static int nextListId = 1;

    private GL11() {
    }

    public static void glPushAttrib(int mask) {
    }

    public static void glPopAttrib() {
    }

    public static void glAlphaFunc(int func, float ref) {
    }

    public static void glColorMaterial(int face, int mode) {
    }

    public static void glLight(int light, int pname, FloatBuffer params) {
    }

    public static void glLightModel(int pname, FloatBuffer params) {
    }

    public static void glNormal3f(float x, float y, float z) {
    }

    public static void glDepthFunc(int func) {
    }

    public static void glDepthMask(boolean flag) {
    }

    public static void glBlendFunc(int sfactor, int dfactor) {
    }

    public static void glFogi(int pname, int param) {
    }

    public static void glFogf(int pname, float param) {
    }

    public static void glFog(int pname, FloatBuffer params) {
    }

    public static void glCullFace(int mode) {
    }

    public static void glPolygonMode(int face, int mode) {
    }

    public static void glPolygonOffset(float factor, float units) {
    }

    public static void glLogicOp(int opcode) {
    }

    public static void glTexGeni(int coord, int pname, int param) {
    }

    public static void glTexGen(int coord, int pname, FloatBuffer params) {
    }

    public static void glTexEnv(int target, int pname, FloatBuffer params) {
    }

    public static void glTexEnvi(int target, int pname, int param) {
    }

    public static void glTexEnvf(int target, int pname, float param) {
    }

    public static void glTexParameterf(int target, int pname, float param) {
    }

    public static void glTexParameteri(int target, int pname, int param) {
    }

    public static int glGetTexLevelParameteri(int target, int level, int pname) {
        return 0;
    }

    public static int glGenTextures() {
        return nextTextureId++;
    }

    public static void glDeleteTextures(int texture) {
    }

    public static void glBindTexture(int target, int texture) {
    }

    public static void glTexImage2D(int target, int level, int internalFormat, int width, int height, int border,
            int format, int type, IntBuffer pixels) {
    }

    public static void glTexSubImage2D(int target, int level, int xoffset, int yoffset, int width, int height,
            int format, int type, IntBuffer pixels) {
    }

    public static void glCopyTexSubImage2D(int target, int level, int xoffset, int yoffset, int x, int y, int width,
            int height) {
    }

    public static void glGetTexImage(int target, int level, int format, int type, IntBuffer pixels) {
    }

    public static void glShadeModel(int mode) {
    }

    public static void glViewport(int x, int y, int width, int height) {
    }

    public static void glColorMask(boolean red, boolean green, boolean blue, boolean alpha) {
    }

    public static void glClearDepth(double depth) {
    }

    public static void glClearColor(float red, float green, float blue, float alpha) {
    }

    public static void glClear(int mask) {
    }

    public static void glMatrixMode(int mode) {
    }

    public static void glLoadIdentity() {
    }

    public static void glPushMatrix() {
    }

    public static void glPopMatrix() {
    }

    public static void glGetFloat(int pname, FloatBuffer params) {
    }

    public static void glOrtho(double left, double right, double bottom, double top, double zNear, double zFar) {
    }

    public static void glRotatef(float angle, float x, float y, float z) {
    }

    public static void glScalef(float x, float y, float z) {
    }

    public static void glScaled(double x, double y, double z) {
    }

    public static void glTranslatef(float x, float y, float z) {
    }

    public static void glTranslated(double x, double y, double z) {
    }

    public static void glMultMatrix(FloatBuffer matrix) {
    }

    public static void glColor4f(float red, float green, float blue, float alpha) {
    }

    public static void glTexCoord2f(float s, float t) {
    }

    public static void glVertex3f(float x, float y, float z) {
    }

    public static void glNormalPointer(int type, int stride, ByteBuffer pointer) {
    }

    public static void glTexCoordPointer(int size, int type, int stride, long pointerOffset) {
    }

    public static void glTexCoordPointer(int size, int stride, int type, ByteBuffer pointer) {
    }

    public static void glVertexPointer(int size, int type, int stride, long pointerOffset) {
    }

    public static void glVertexPointer(int size, int stride, int type, ByteBuffer pointer) {
    }

    public static void glColorPointer(int size, int type, int stride, long pointerOffset) {
    }

    public static void glColorPointer(int size, boolean normalized, int stride, ByteBuffer pointer) {
    }

    public static void glColorPointer(int size, int stride, int type, ByteBuffer pointer) {
    }

    public static void glDisableClientState(int array) {
    }

    public static void glEnableClientState(int array) {
    }

    public static void glBegin(int mode) {
    }

    public static void glEnd() {
    }

    public static void glDrawArrays(int mode, int first, int count) {
    }

    public static void glLineWidth(float width) {
    }

    public static void glCallList(int list) {
    }

    public static void glDeleteLists(int list, int range) {
    }

    public static void glNewList(int list, int mode) {
    }

    public static void glEndList() {
    }

    public static int glGenLists(int range) {
        int first = nextListId;
        nextListId += Math.max(range, 1);
        return first;
    }

    public static void glPixelStorei(int pname, int param) {
    }

    public static void glReadPixels(int x, int y, int width, int height, int format, int type, IntBuffer pixels) {
    }

    public static int glGetError() {
        return 0;
    }

    public static String glGetString(int name) {
        if (name == 7936) {
            return "Nexus Browser GL";
        }

        return "";
    }

    public static void glGetInteger(int pname, IntBuffer params) {
        if (params != null && params.hasRemaining()) {
            params.put(params.position(), 0);
        }
    }

    public static int glGetInteger(int pname) {
        return 0;
    }

    public static void glEnable(int cap) {
    }

    public static void glDisable(int cap) {
    }
}