package org.lwjgl.util.glu;

import java.nio.FloatBuffer;
import java.nio.IntBuffer;

public final class GLU {
    private GLU() {
    }

    public static String gluErrorString(int errorCode) {
        if (errorCode == 0) {
            return "No error";
        }

        return "GL error " + errorCode;
    }

    public static boolean gluUnProject(float winX, float winY, float winZ, FloatBuffer model, FloatBuffer projection,
            IntBuffer viewport, FloatBuffer objectCoordinates) {
        if (objectCoordinates != null && objectCoordinates.remaining() >= 3) {
            objectCoordinates.put(objectCoordinates.position(), winX);
            objectCoordinates.put(objectCoordinates.position() + 1, winY);
            objectCoordinates.put(objectCoordinates.position() + 2, winZ);
        }

        return true;
    }
}