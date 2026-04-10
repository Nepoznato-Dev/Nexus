package org.lwjgl.opengl;

import java.nio.ByteBuffer;
import java.nio.FloatBuffer;
import java.nio.IntBuffer;

public final class ARBShaderObjects {
    private ARBShaderObjects() {
    }

    public static int glGetObjectParameteriARB(int object, int pname) {
        return 1;
    }

    public static void glAttachObjectARB(int containerObj, int obj) {
        GL20.glAttachShader(containerObj, obj);
    }

    public static void glDeleteObjectARB(int object) {
    }

    public static int glCreateShaderObjectARB(int shaderType) {
        return GL20.glCreateShader(shaderType);
    }

    public static void glShaderSourceARB(int shader, ByteBuffer string) {
        GL20.glShaderSource(shader, string);
    }

    public static void glCompileShaderARB(int shader) {
        GL20.glCompileShader(shader);
    }

    public static String glGetInfoLogARB(int object, int maxLength) {
        return "";
    }

    public static void glUseProgramObjectARB(int program) {
        GL20.glUseProgram(program);
    }

    public static int glCreateProgramObjectARB() {
        return GL20.glCreateProgram();
    }

    public static void glLinkProgramARB(int program) {
        GL20.glLinkProgram(program);
    }

    public static int glGetUniformLocationARB(int program, CharSequence name) {
        return GL20.glGetUniformLocation(program, name);
    }

    public static void glUniform1ARB(int location, IntBuffer values) {
        GL20.glUniform1(location, values);
    }

    public static void glUniform1iARB(int location, int value) {
        GL20.glUniform1i(location, value);
    }

    public static void glUniform1ARB(int location, FloatBuffer values) {
        GL20.glUniform1(location, values);
    }

    public static void glUniform2ARB(int location, IntBuffer values) {
        GL20.glUniform2(location, values);
    }

    public static void glUniform2ARB(int location, FloatBuffer values) {
        GL20.glUniform2(location, values);
    }

    public static void glUniform3ARB(int location, IntBuffer values) {
        GL20.glUniform3(location, values);
    }

    public static void glUniform3ARB(int location, FloatBuffer values) {
        GL20.glUniform3(location, values);
    }

    public static void glUniform4ARB(int location, IntBuffer values) {
        GL20.glUniform4(location, values);
    }

    public static void glUniform4ARB(int location, FloatBuffer values) {
        GL20.glUniform4(location, values);
    }

    public static void glUniformMatrix2ARB(int location, boolean transpose, FloatBuffer matrices) {
        GL20.glUniformMatrix2(location, transpose, matrices);
    }

    public static void glUniformMatrix3ARB(int location, boolean transpose, FloatBuffer matrices) {
        GL20.glUniformMatrix3(location, transpose, matrices);
    }

    public static void glUniformMatrix4ARB(int location, boolean transpose, FloatBuffer matrices) {
        GL20.glUniformMatrix4(location, transpose, matrices);
    }
}