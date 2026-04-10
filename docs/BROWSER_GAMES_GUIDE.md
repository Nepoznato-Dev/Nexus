# Browser Games & Minecraft Integration Guide

This guide covers how to run Minecraft and Java games in the browser using transpilation technology (like Eaglercraft).

## Phase 1: Eaglercraft Integration

### What is Eaglercraft?

Eaglercraft is **Minecraft compiled to JavaScript/WebAssembly** that runs entirely in the browser with no downloads or installations.

- ✓ Minecraft 1.8.8 gameplay
- ✓ Join multiplayer servers
- ✓ Works on Chromebooks (no install needed)
- ✓ Open source (GitHub: LAX1DUDE/eaglercraft)

### Setup: Integrate Eaglercraft into Nexus

#### Option A: Download Pre-Built (Recommended for Phase 1)

1. **Download Eaglercraft**
   ```bash
   # Go to GitHub releases
   # https://github.com/LAX1DUDE/eaglercraft/releases
   # Download the latest stable build (usually a .zip file)
   ```

2. **Extract to Nexus**
   ```bash
   # Unzip the downloaded file
   unzip eaglercraft-*.zip -d /tmp/eaglercraft-extract
   
   # Copy contents to Nexus
   cp -r /tmp/eaglercraft-extract/* /workspaces/Nexus-Community-Project/public/games/eaglercraft/
   ```

3. **Verify Structure**
   ```
   /public/games/eaglercraft/
   ├── index.html         (or main.html, depends on Eaglercraft version)
   ├── assets/
   ├── js/
   ├── wasm/              (WebAssembly modules)
   └── ...
   ```

4. **Test in Nexus**
   - Start the development server: `npm start`
   - Navigate to the Games section
   - Click "Eaglercraft"
   - Should load Minecraft in browser

#### Option B: Clone & Build Eaglercraft (Advanced)

```bash
# Clone Eaglercraft repo
git clone https://github.com/LAX1DUDE/eaglercraft.git /tmp/eaglercraft-src

# Follow their build instructions (requires Java, Maven, Node.js)
cd /tmp/eaglercraft-src
# See their README for build steps

# Copy built output to Nexus
cp -r /tmp/eaglercraft-src/dist/* /public/games/eaglercraft/
```

---

## Phase 2: Understanding Eaglercraft's Architecture

### How Does Java → Browser Work?

**Traditional Minecraft Flow:**
```
Java Source Code → Java Compiler → .class files → JVM → Native Code → Display
```

**Eaglercraft Flow:**
```
Java Source Code → TeaVM Compiler → JavaScript/WebAssembly → Browser → WebGL
```

### Key Components

#### 1. **TeaVM: Java to JavaScript/WASM**

TeaVM is a compiler that transforms Java bytecode into:
- **WebAssembly (.wasm)** - High-performance, native-speed code
- **JavaScript (.js)** - Fallback for browsers without WASM support

**Usage in Eaglercraft:**
```
Minecraft Java Code → TeaVM → JavaScript/WASM → Runs in Browser
```

**Eaglercraft's exact approach:**
- Starts with decompiled Minecraft source (1.8.8)
- Uses TeaVM with custom plugins for:
  - LWJGL (graphics library) → WebGL translation
  - Java NIO (networking) → WebSocket translation
  - File I/O → IndexedDB translation

#### 2. **WebGL: Rendering Layer**

Minecraft uses **OpenGL** for rendering. Eaglercraft patches this:

```java
// Original Minecraft code
GL11.glClear(GL11.GL_COLOR_BUFFER_BIT);
glDrawElements(...);

// After TeaVM + WebGL plugin compilation
context.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);
gl.drawElements(...);
```

#### 3. **Network Protocol**

- Minecraft protocol is public (implemented by Fabric, Spigot, etc.)
- Eaglercraft uses actual MC protocol to connect to real servers
- Custom servers available for Eaglercraft-specific features

#### 4. **Rendering to Canvas**

```javascript
// Final output: HTML5 Canvas
<canvas id="minecraft"></canvas>
<script src="gamelaunch.js"></script>
```

### Eaglercraft's Build Pipeline

```
Source (Java)
    ↓
Maven/Gradle (dependency management)
    ↓
TeaVM Maven Plugin (Java → JavaScript/WASM)
    ↓
LWJGL Patches (Graphics library translation)
    ↓
Networking Patches (WebSocket for multiplayer)
    ↓
File I/O Patches (IndexedDB for world saves)
    ↓
Build Output (HTML + JS + WASM)
    ↓
dist/ folder → copy to /public/games/eaglercraft/
```

---

## Phase 3: Creating Custom Transpilers

### Starting Simple: From Eaglercraft to Custom Games

Instead of starting with full Minecraft, build incrementally:

1. **Simple 2D Game (Processing.js adapter)**
   - Start with Processing or LibGDX game
   - Use TeaVM to compile
   - 80% less complexity than 3D rendering

2. **Mid-Size 3D Game**
   - Custom game using LWJGL for graphics
   - Repeat Eaglercraft's WebGL translation
   - Use as template for architecture

3. **Full Minecraft Clone**
   - Once you understand the pipeline, fork Eaglercraft
   - Customize as needed

### Setting Up TeaVM for Custom Projects

#### Install TeaVM

```bash
# Prerequisites
# - Java JDK 11+ (check with: java -version)
# - Maven 3.6+ (check with: mvn -version)

# Create new Maven project
mvn archetype:generate \
  -DgroupId=com.nexus.games \
  -DartifactId=browser-game \
  -DarchetypeArtifactId=maven-archetype-quickstart

cd browser-game
```

#### Configure pom.xml for TeaVM

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.teavm</groupId>
      <artifactId>teavm-maven-plugin</artifactId>
      <version>0.9.0</version>
      <executions>
        <execution>
          <goals>
            <goal>compile</goal>
          </goals>
        </execution>
      </executions>
      <configuration>
        <targetDirectory>${project.build.directory}/generated/wasm</targetDirectory>
        <mainClass>com.nexus.games.Main</mainClass>
        <optimizationLevel>FULL</optimizationLevel>
      </configuration>
    </plugin>
  </plugins>
</build>
```

#### Simple Game Entry Point

```java
// src/main/java/com/nexus/games/Main.java
public class Main {
    public static void main(String[] args) {
        // Initialize canvas
        Canvas canvas = Canvas.create("game-canvas");
        
        // Game loop
        while (running) {
            update();
            render(canvas);
        }
    }
}
```

#### Build It

```bash
mvn clean package
# Output: target/generated/wasm/
# Copy to Nexus: cp -r target/generated/wasm/* /public/games/my-game/
```

---

## Testing & Debugging

### In Nexus Browser

**Chrome DevTools:**
- Press `F12` to open DevTools
- Sources tab: debug JavaScript
- Console: check for errors
- Network: monitor WebSocket connections (multiplayer)

### Local Testing

```bash
# From Nexus root
npm start
# Opens http://localhost:3000

# Navigate to: http://localhost:3000/games/eaglercraft
```

---

## Troubleshooting

### Eaglercraft Won't Load

**Problem:** Shows "Eaglercraft files not found"
```
Solution:
1. Verify files in /public/games/eaglercraft/
2. Check that main entry point is index.html OR update the loader
3. Check browser console (F12) for errors
```

**Problem:** Loads but shows blank canvas
```
Solution:
1. Check WebGL support: Open console, type: WebGLRenderingContext
2. Ensure WASM files are loaded (Network tab)
3. Check for CORS errors if loading from CDN
```

### Server Connection Issues

**Problem:** Can't join multiplayer servers
```
Solution:
1. Ensure WebSocket proxy is available (if behind firewall)
2. Check Eaglercraft server list for compatible servers
3. Verify network firewall allows port connections
```

---

## References

- [Eaglercraft GitHub](https://github.com/LAX1DUDE/eaglercraft)
- [TeaVM Documentation](http://www.teavm.org/)
- [LWJGL Documentation](https://www.lwjgl.org/)
- [WebGL Documentation](https://www.khronos.org/webgl/)
- [Minecraft Protocol Docs](https://wiki.vg/)

---

## Next Steps

1. **Phase 1-Complete**: Download & integrate Eaglercraft ✓
2. **Phase 2-In Progress**: Study build architecture
3. **Phase 3-TODO**: Set up TeaVM for custom games
4. **Phase 4-TODO**: Build first custom browser game
