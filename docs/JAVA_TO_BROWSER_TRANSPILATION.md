# Eaglercraft Technical Deep Dive

How Eaglercraft gets Minecraft running in the browser, and how to replicate this approach.

## Table of Contents
1. High-Level Pipeline
2. Java → JavaScript Compilation
3. Graphics Translation (OpenGL → WebGL)
4. Networking Adaptation
5. Building Your Own

---

## 1. High-Level Pipeline

```
┌─────────────────────┐
│ Minecraft Java Code │ (decompiled from official launcher)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ TeaVM Compiler      │ (Java bytecode → JavaScript/WASM)
│ + Custom Plugins    │
└──────────┬──────────┘
           │
     ┌─────┴──────┐
     │            │
     ▼            ▼
┌─────────┐  ┌──────────┐
│ WASM    │  │JavaScript│
│ Modules │  │ Fallback │
└────┬────┘  └────┬─────┘
     │            │
     └─────┬──────┘
           │
           ▼
┌─────────────────────┐
│ Browser Runtime     │
│ (WebGL Context)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ HTML5 Canvas Output │
└─────────────────────┘
```

---

## 2. Java → JavaScript Compilation (TeaVM)

### The Problem
Java runs on the **Java Virtual Machine (JVM)**, which:
- Interprets Java bytecode (`.class` files)
- Has garbage collection
- Requires a native runtime environment

Browsers can't run a JVM, so we need to **translate Java to JavaScript**.

### The Solution: TeaVM

TeaVM takes Java bytecode and compiles it to:
1. **JavaScript** (for all browsers)
2. **WebAssembly** (for modern browsers, much faster)

### How TeaVM Works

**Step 1: Class Loading**
```java
// Original Minecraft class
public class EntityPlayer extends Entity {
    public void attack(Entity other) {
        // ... attack logic
    }
}
```

**Step 2: Bytecode Analysis**
- TeaVM reads the compiled `.class` files
- Analyzes dependencies and call graph
- Determines what needs to be in JavaScript

**Step 3: Code Generation**
```javascript
// Generated JavaScript equivalent
var EntityPlayer = function() {
    Entity.call(this);
};
EntityPlayer.prototype.attack = function(other) {
    // ... attack logic translated to JS
};
```

**Step 4: Optimization**
- Dead code elimination
- Inlining small functions
- WebAssembly generation for hot paths

### TeaVM Configuration (in pom.xml)

```xml
<plugin>
    <groupId>org.teavm</groupId>
    <artifactId>teavm-maven-plugin</artifactId>
    <version>0.9.0</version>
    <configuration>
        <!-- Target directory for output -->
        <targetDirectory>target/generated/wasm</targetDirectory>
        
        <!-- Main entry point -->
        <mainClass>net.minecraft.client.main.Main</mainClass>
        
        <!-- Optimization level -->
        <!-- NONE, SIMPLE, FULL -->
        <optimizationLevel>FULL</optimizationLevel>
        
        <!-- Generate source maps for debugging -->
        <debugInformationLevel>ALL</debugInformationLevel>
        
        <!-- Include entire class hierarchy -->
        <incremental>false</incremental>
    </configuration>
</plugin>
```

### Key Classes TeaVM Must Handle for Minecraft

```
net.minecraft.client.main.Main
    ↓ calls
net.minecraft.client.Minecraft (game loop)
    ↓ uses
org.lwjgl.opengl.GL (graphics)
org.lwjgl.input.Keyboard (input)
java.nio.ByteBuffer (memory)
java.net.Socket (networking)
```

---

## 3. Graphics Translation (OpenGL → WebGL)

### The Core Problem

**Minecraft rendering pipeline:**
```
Game Logic → OpenGL API → GPU drivers → Screen
```

**Browser rendering pipeline:**
```
Game Logic → JavaScript → WebGL → GPU → Canvas
```

Eaglercraft intercepts OpenGL calls and translates them to WebGL.

### LWJGL (Lightweight Java Game Library)

Minecraft uses LWJGL for OpenGL. Eaglercraft patches LWJGL to use WebGL instead.

**Original Minecraft code:**
```java
import org.lwjgl.opengl.GL11;
import org.lwjgl.opengl.GL20;

public class RenderEngine {
    public void renderblock() {
        GL11.glBindTexture(GL11.GL_TEXTURE_2D, textureId);
        GL11.glBegin(GL11.GL_TRIANGLES); // Start a triangle
        GL11.glVertex3f(0, 0, 0);
        GL11.glVertex3f(1, 0, 0);
        GL11.glVertex3f(0.5f, 1, 0);
        GL11.glEnd();
    }
}
```

**After TeaVM + WebGL translation:**
```javascript
var RenderEngine = function() {};

RenderEngine.prototype.renderBlock = function() {
    gl.bindTexture(gl.TEXTURE_2D, textureId);
    
    // WebGL doesn't have GL_BEGIN/GL_END
    // Must use vertex buffers instead
    
    var vertices = [
        0, 0, 0,
        1, 0, 0,
        0.5, 1, 0
    ];
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    gl.drawArrays(gl.TRIANGLES, 0, 3);
};
```

### Eaglercraft's LWJGL Patches

**Location in Eaglercraft source:**
```
eaglercraft/src/lwjgl/
├── org/lwjgl/opengl/GL11.java    → Patched for WebGL
├── org/lwjgl/opengl/GL20.java    → Shader support
├── org/lwjgl/opengl/Display.java → Canvas initialization
└── org/lwjgl/input/Keyboard.java → Browser input events
```

**Patch Example (simplified):**
```java
// Original: org/lwjgl/opengl/GL11.java
public class GL11 {
    public static void glBegin(int mode) {
        // Native OpenGL call
    }
}

// Patched for browser:
public class GL11 {
    private static js.lang.JSObject webglContext;
    
    public static void glBegin(int mode) {
        // Translate to WebGL
        if (mode == GL_TRIANGLES) {
            // Buffer geometry, don't use glBegin
            prepareVertexArrays();
        }
    }
}
```

---

## 4. Networking Adaptation

### Problem
Minecraft uses raw TCP sockets, but browsers can't do that (security).

### Solution
Use **WebSocket** as a proxy to Minecraft servers.

**Architecture:**
```
┌──────────────────┐
│ Browser Client   │
│ (Eaglercraft)    │
└────────┬─────────┘
         │ WebSocket
         │
┌────────▼─────────┐
│ WebSocket Proxy  │ (Could be in codespace)
│ or Eaglercraft   │
│ Official Server  │
└────────┬─────────┘
         │ TCP Socket
         │
┌────────▼─────────┐
│ Minecraft Server │
│ (e.g., Spigot)   │
└──────────────────┘
```

**Java networking in Minecraft:**
```java
// Original code
Socket socket = new Socket("server.com", 25565);
InputStream in = socket.getInputStream();
OutputStream out = socket.getOutputStream();
out.write(data);
```

**Eaglercraft's WebSocket adaptation:**
```javascript
// Generated JavaScript
var WebSocketAdapter = {
    connect: function(host, port) {
        this.ws = new WebSocket("wss://" + host + ":" + port);
        this.ws.binaryType = "arraybuffer";
    },
    
    write: function(data) {
        this.ws.send(data);
    },
    
    read: function() {
        // Async read via onmessage
    }
};
```

---

## 5. Building Your Own

### Option A: Study Eaglercraft Source

```bash
# Clone the repository
git clone https://github.com/LAX1DUDE/eaglercraft.git
cd eaglercraft

# Explore structure
tree -L 2
```

**Key directories:**
- `src/` - Original Minecraft decompiled source
- `patches/` - Modifications to LWJGL and other libs
- `pom.xml` - Maven build configuration (TeaVM settings)
- `build.sh` - Build script

**Build it:**
```bash
# Install dependencies
mvn clean install

# See build.sh for full build command
./build.sh
```

### Option B: Start Simpler - Custom LibGDX Game

**Why LibGDX?**
- Modern Java game framework
- Smaller than Minecraft (easier to compile)
- Better WebGL support out of the box
- Good learning project before tackling Minecraft

**Steps:**
```bash
# 1. Create LibGDX project
# Use gdx-setup tool: https://libgdx.badlogicgames.com/

# 2. Add TeaVM to pom.xml (see Section 2)

# 3. Write your game in Java
# 4. Compile with: mvn clean package
# 5. Copy target/generated/wasm to Nexus
```

### Option C: Contribute to Eaglercraft

Instead of building from scratch:
- Fork Eaglercraft
- Add your features (new mobs, blocks, etc.)
- Maintain compatibility with their build pipeline
- Deploy through Nexus

---

## 6. Performance Considerations

### Why WebAssembly?

JavaScript is **~10x slower** than native code.  
WebAssembly is **~1.5-2x slower** than native code.

This is why Eaglercraft uses WASM for hot code paths:

```
Game Logic (JavaScript): Tick updates, collision checks
├── Hot Path: Block rendering (WASM)
├── Hot Path: Entity AI (WASM)
├── Hot Path: Physics simulation (WASM)
└── UI / Input: JavaScript (fine)
```

### Profiling in Browser

**Chrome DevTools:**
1. Press F12
2. Performance tab
3. Record while playing
4. Analyze frame time
5. Look for slow JavaScript functions

---

## 7. Deployment in Nexus

Once you have your Java game compiled to JavaScript:

```bash
# 1. Copy compiled output
cp -r build/output/* /public/games/my-game/

# 2. Create loader HTML
cat > /public/games/my-game/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>My Game</title>
</head>
<body>
    <canvas id="canvas" width="800" height="600"></canvas>
    <script src="mygame.js"></script>
</body>
</html>
EOF

# 3. Update games manifest (Nexus will auto-detect)
# 4. Test in browser
```

---

## References & Resources

- [TeaVM Documentation](http://www.teavm.org/docs/)
- [TeaVM GitHub](https://github.com/konsoletyper/teavm)
- [Eaglercraft GitHub](https://github.com/LAX1DUDE/eaglercraft)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [Minecraft Wiki Protocol](https://wiki.vg/Protocol)
- [LWJGL Documentation](https://www.lwjgl.org/guide)
- [LibGDX Setup](https://libgdx.badlogicgames.com/wiki/start)
