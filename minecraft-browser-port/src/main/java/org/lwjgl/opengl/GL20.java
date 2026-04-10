package org.lwjgl.opengl;

import java.nio.ByteBuffer;
import java.nio.FloatBuffer;
import java.nio.IntBuffer;

public final class GL20 {
    private static int nextShaderId = 1;
    private static int nextProgramId = 1;

    private GL20() {
    }

    public static int glGetProgrami(int program, int pname) {
        return 1;
    }

    public static void glAttachShader(int program, int shader) {
    }

    public static void glDeleteShader(int shader) {
    }

    public static int glCreateShader(int type) {
        return nextShaderId++;
    }

    public static void glShaderSource(int shader, ByteBuffer string) {
    }

    public static void glCompileShader(int shader) {
    }

    public static int glGetShaderi(int shader, int pname) {
        return 1;
    }

    public static String glGetShaderInfoLog(int shader, int maxLength) {
        return "";
    }

    public static String glGetProgramInfoLog(int program, int maxLength) {
        return "";
    }

    public static void glUseProgram(int program) {
    }

    public static int glCreateProgram() {
        return nextProgramId++;
    }

    public static void glDeleteProgram(int program) {
    }

    public static void glLinkProgram(int program) {
    }

    public static int glGetUniformLocation(int program, CharSequence name) {
        return 0;
    }

    public static void glUniform1(int location, IntBuffer values) {
    }

    public static void glUniform1i(int location, int value) {
    }

    public static void glUniform1(int location, FloatBuffer values) {
    }

    public static void glUniform2(int location, IntBuffer values) {
    }

    public static void glUniform2(int location, FloatBuffer values) {
    }

    public static void glUniform3(int location, IntBuffer values) {
    }

    public static void glUniform3(int location, FloatBuffer values) {
    }

    public static void glUniform4(int location, IntBuffer values) {
    }

    public static void glUniform4(int location, FloatBuffer values) {
    }

    public static void glUniformMatrix2(int location, boolean transpose, FloatBuffer matrices) {
    }

    public static void glUniformMatrix3(int location, boolean transpose, FloatBuffer matrices) {
    }

    public static void glUniformMatrix4(int location, boolean transpose, FloatBuffer matrices) {
    }

    public static int glGetAttribLocation(int program, CharSequence name) {
        return 0;
    }
}