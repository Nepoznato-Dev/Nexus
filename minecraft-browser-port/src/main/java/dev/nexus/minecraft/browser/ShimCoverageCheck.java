package dev.nexus.minecraft.browser;

import java.nio.ByteBuffer;
import java.nio.FloatBuffer;
import java.nio.IntBuffer;
import org.lwjgl.BufferUtils;
import org.lwjgl.Sys;
import org.lwjgl.input.Keyboard;
import org.lwjgl.input.Mouse;
import org.lwjgl.opengl.ARBFramebufferObject;
import org.lwjgl.opengl.ARBMultitexture;
import org.lwjgl.opengl.ARBShaderObjects;
import org.lwjgl.opengl.ARBVertexBufferObject;
import org.lwjgl.opengl.ARBVertexShader;
import org.lwjgl.opengl.ContextCapabilities;
import org.lwjgl.opengl.Display;
import org.lwjgl.opengl.DisplayMode;
import org.lwjgl.opengl.EXTBlendFuncSeparate;
import org.lwjgl.opengl.EXTFramebufferObject;
import org.lwjgl.opengl.GL11;
import org.lwjgl.opengl.GL13;
import org.lwjgl.opengl.GL14;
import org.lwjgl.opengl.GL15;
import org.lwjgl.opengl.GL20;
import org.lwjgl.opengl.GL30;
import org.lwjgl.opengl.GLContext;
import org.lwjgl.opengl.PixelFormat;
import org.lwjgl.util.glu.GLU;
import org.lwjgl.util.glu.Project;
import org.lwjgl.util.vector.Matrix4f;
import org.lwjgl.util.vector.Quaternion;
import org.lwjgl.util.vector.Vector3f;
import org.lwjgl.util.vector.Vector4f;

/**
 * Compile-time smoke coverage for shim signatures used by the current source
 * slice.
 */
public final class ShimCoverageCheck {
    private ShimCoverageCheck() {
    }

    public static void verify() throws Exception {
        ByteBuffer bytes = BufferUtils.createByteBuffer(16);
        FloatBuffer floats = BufferUtils.createFloatBuffer(16);
        IntBuffer ints = BufferUtils.createIntBuffer(16);

        Sys.getVersion();
        Sys.getTime();
        Sys.getTimerResolution();
        Sys.openURL("about:blank");

        Display.create();
        Display.create(new PixelFormat().withDepthBits(24));
        Display.setResizable(true);
        Display.setTitle("ShimCoverage");
        Display.setDisplayMode(new DisplayMode(854, 480));
        Display.getDisplayMode();
        Display.getDesktopDisplayMode();
        Display.getAvailableDisplayModes();
        Display.setFullscreen(false);
        Display.isFullscreen();
        Display.setVSyncEnabled(true);
        Display.isVSyncEnabled();
        Display.setIcon(new ByteBuffer[] { bytes });
        Display.sync(60);
        Display.update();
        Display.isCloseRequested();
        Display.wasResized();
        Display.getWidth();
        Display.getHeight();
        Display.isActive();
        Display.destroy();

        Keyboard.isCreated();
        Keyboard.next();
        Keyboard.getEventKey();
        Keyboard.getEventCharacter();
        Keyboard.getEventKeyState();
        Keyboard.isRepeatEvent();
        Keyboard.isKeyDown(1);
        Keyboard.enableRepeatEvents(true);
        Keyboard.areRepeatEventsEnabled();
        Keyboard.getKeyName(1);

        Mouse.isCreated();
        Mouse.next();
        Mouse.getX();
        Mouse.getY();
        Mouse.getDX();
        Mouse.getDY();
        Mouse.getDWheel();
        Mouse.getEventButton();
        Mouse.getEventX();
        Mouse.getEventY();
        Mouse.getEventDWheel();
        Mouse.getEventButtonState();
        Mouse.isButtonDown(0);
        Mouse.setGrabbed(true);
        Mouse.isGrabbed();
        Mouse.setCursorPosition(0, 0);
        Mouse.isInsideWindow();

        GL11.glPushAttrib(0);
        GL11.glPopAttrib();
        GL11.glBlendFunc(1, 0);
        GL11.glLineWidth(1.0F);
        GL11.glGetString(7936);
        GL11.glGetInteger(0, ints);
        GL11.glGetInteger(0);
        GL11.glGetError();

        GL13.glActiveTexture(0);
        GL13.glClientActiveTexture(0);
        GL13.glMultiTexCoord2f(0, 0.0F, 0.0F);

        GL14.glBlendEquation(0);
        GL14.glBlendFuncSeparate(1, 0, 1, 0);

        int bufferId = GL15.glGenBuffers();
        GL15.glBindBuffer(0, bufferId);
        GL15.glBufferData(0, bytes, 0);
        GL15.glDeleteBuffers(bufferId);

        int shader = GL20.glCreateShader(0);
        int program = GL20.glCreateProgram();
        GL20.glAttachShader(program, shader);
        GL20.glShaderSource(shader, bytes);
        GL20.glCompileShader(shader);
        GL20.glGetShaderi(shader, 0);
        GL20.glGetProgrami(program, 0);
        GL20.glGetShaderInfoLog(shader, 1024);
        GL20.glGetProgramInfoLog(program, 1024);
        GL20.glUseProgram(program);
        GL20.glLinkProgram(program);
        GL20.glGetUniformLocation(program, "u");
        GL20.glUniform1i(0, 0);
        GL20.glUniform1(0, ints);
        GL20.glUniform1(0, floats);
        GL20.glUniform2(0, ints);
        GL20.glUniform2(0, floats);
        GL20.glUniform3(0, ints);
        GL20.glUniform3(0, floats);
        GL20.glUniform4(0, ints);
        GL20.glUniform4(0, floats);
        GL20.glUniformMatrix2(0, false, floats);
        GL20.glUniformMatrix3(0, false, floats);
        GL20.glUniformMatrix4(0, false, floats);
        GL20.glGetAttribLocation(program, "a");
        GL20.glDeleteShader(shader);
        GL20.glDeleteProgram(program);

        int framebuffer = GL30.glGenFramebuffers();
        int renderbuffer = GL30.glGenRenderbuffers();
        GL30.glBindFramebuffer(0, framebuffer);
        GL30.glBindRenderbuffer(0, renderbuffer);
        GL30.glRenderbufferStorage(0, 0, 16, 16);
        GL30.glFramebufferRenderbuffer(0, 0, 0, renderbuffer);
        GL30.glCheckFramebufferStatus(0);
        GL30.glFramebufferTexture2D(0, 0, 0, 0, 0);
        GL30.glDeleteRenderbuffers(renderbuffer);
        GL30.glDeleteFramebuffers(framebuffer);

        ARBMultitexture.glActiveTextureARB(0);
        ARBMultitexture.glClientActiveTextureARB(0);
        ARBMultitexture.glMultiTexCoord2fARB(0, 0.0F, 0.0F);

        ARBShaderObjects.glGetObjectParameteriARB(0, 0);
        ARBShaderObjects.glAttachObjectARB(0, 0);
        ARBShaderObjects.glDeleteObjectARB(0);
        ARBShaderObjects.glCreateShaderObjectARB(0);
        ARBShaderObjects.glShaderSourceARB(0, bytes);
        ARBShaderObjects.glCompileShaderARB(0);
        ARBShaderObjects.glGetInfoLogARB(0, 1024);
        ARBShaderObjects.glUseProgramObjectARB(0);
        ARBShaderObjects.glCreateProgramObjectARB();
        ARBShaderObjects.glLinkProgramARB(0);
        ARBShaderObjects.glGetUniformLocationARB(0, "u");
        ARBShaderObjects.glUniform1iARB(0, 0);
        ARBShaderObjects.glUniform1ARB(0, ints);
        ARBShaderObjects.glUniform1ARB(0, floats);
        ARBShaderObjects.glUniform2ARB(0, ints);
        ARBShaderObjects.glUniform2ARB(0, floats);
        ARBShaderObjects.glUniform3ARB(0, ints);
        ARBShaderObjects.glUniform3ARB(0, floats);
        ARBShaderObjects.glUniform4ARB(0, ints);
        ARBShaderObjects.glUniform4ARB(0, floats);
        ARBShaderObjects.glUniformMatrix2ARB(0, false, floats);
        ARBShaderObjects.glUniformMatrix3ARB(0, false, floats);
        ARBShaderObjects.glUniformMatrix4ARB(0, false, floats);

        ARBVertexShader.glGetAttribLocationARB(0, "a");
        ARBVertexBufferObject.glGenBuffersARB();
        ARBVertexBufferObject.glBindBufferARB(0, 0);
        ARBVertexBufferObject.glBufferDataARB(0, bytes, 0);
        ARBVertexBufferObject.glDeleteBuffersARB(0);

        ARBFramebufferObject.glBindFramebuffer(0, 0);
        ARBFramebufferObject.glBindRenderbuffer(0, 0);
        ARBFramebufferObject.glDeleteRenderbuffers(0);
        ARBFramebufferObject.glDeleteFramebuffers(0);
        ARBFramebufferObject.glGenFramebuffers();
        ARBFramebufferObject.glGenRenderbuffers();
        ARBFramebufferObject.glRenderbufferStorage(0, 0, 16, 16);
        ARBFramebufferObject.glFramebufferRenderbuffer(0, 0, 0, 0);
        ARBFramebufferObject.glCheckFramebufferStatus(0);
        ARBFramebufferObject.glFramebufferTexture2D(0, 0, 0, 0, 0);

        EXTBlendFuncSeparate.glBlendFuncSeparateEXT(1, 0, 1, 0);
        EXTFramebufferObject.glBindFramebufferEXT(0, 0);
        EXTFramebufferObject.glBindRenderbufferEXT(0, 0);
        EXTFramebufferObject.glDeleteRenderbuffersEXT(0);
        EXTFramebufferObject.glDeleteFramebuffersEXT(0);
        EXTFramebufferObject.glGenFramebuffersEXT();
        EXTFramebufferObject.glGenRenderbuffersEXT();
        EXTFramebufferObject.glRenderbufferStorageEXT(0, 0, 16, 16);
        EXTFramebufferObject.glFramebufferRenderbufferEXT(0, 0, 0, 0);
        EXTFramebufferObject.glCheckFramebufferStatusEXT(0);
        EXTFramebufferObject.glFramebufferTexture2DEXT(0, 0, 0, 0, 0);

        GLU.gluErrorString(0);
        GLU.gluUnProject(0.0F, 0.0F, 0.0F, floats, floats, ints, floats);
        Project.gluPerspective(70.0F, 1.0F, 0.05F, 100.0F);

        Vector3f axis = new Vector3f(0.0F, 1.0F, 0.0F);
        Vector3f addTarget = new Vector3f();
        Vector3f.add(new Vector3f(1.0F, 0.0F, 0.0F), axis, addTarget);
        Vector3f.sub(addTarget, axis, addTarget);
        Vector3f.cross(addTarget, axis, addTarget);
        Vector3f.dot(addTarget, axis);

        Matrix4f m = new Matrix4f();
        m.setIdentity();
        Matrix4f.rotate(0.5F, axis, m, m);
        Matrix4f.mul(m, m, m);
        Matrix4f.transform(m, new Vector4f(1.0F, 1.0F, 1.0F, 1.0F), new Vector4f());

        Quaternion q = new Quaternion();
        if (q.w == 2.0F) {
            throw new IllegalStateException("unreachable");
        }

        ContextCapabilities caps = GLContext.getCapabilities();
        if (caps.OpenGL13 && caps.OpenGL14 && caps.OpenGL15 && caps.OpenGL20 && !caps.GL_NV_fog_distance) {
            // No-op: accessing these fields verifies shim field presence.
        }
    }
}