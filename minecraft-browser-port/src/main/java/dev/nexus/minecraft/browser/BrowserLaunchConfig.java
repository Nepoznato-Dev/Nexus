package dev.nexus.minecraft.browser;

import java.util.Objects;

public final class BrowserLaunchConfig {
        private final boolean demo;
        private final boolean fullscreen;
        private final boolean checkGlErrors;
        private final int width;
        private final int height;
        private final String username;
        private final String uuid;
        private final String version;
        private final String accessToken;
        private final String gameDir;
        private final String assetsDir;
        private final String resourcePackDir;
        private final String assetIndex;
        private final String versionType;
        private final String server;
        private final int port;

        public BrowserLaunchConfig(
                        boolean demo,
                        boolean fullscreen,
                        boolean checkGlErrors,
                        int width,
                        int height,
                        String username,
                        String uuid,
                        String version,
                        String accessToken,
                        String gameDir,
                        String assetsDir,
                        String resourcePackDir,
                        String assetIndex,
                        String versionType,
                        String server,
                        int port) {
                this.demo = demo;
                this.fullscreen = fullscreen;
                this.checkGlErrors = checkGlErrors;
                this.width = width;
                this.height = height;
                this.username = username;
                this.uuid = uuid;
                this.version = version;
                this.accessToken = accessToken;
                this.gameDir = gameDir;
                this.assetsDir = assetsDir;
                this.resourcePackDir = resourcePackDir;
                this.assetIndex = assetIndex;
                this.versionType = versionType;
                this.server = server;
                this.port = port;
        }

        public boolean demo() {
                return demo;
        }

        public boolean fullscreen() {
                return fullscreen;
        }

        public boolean checkGlErrors() {
                return checkGlErrors;
        }

        public int width() {
                return width;
        }

        public int height() {
                return height;
        }

        public String username() {
                return username;
        }

        public String uuid() {
                return uuid;
        }

        public String version() {
                return version;
        }

        public String accessToken() {
                return accessToken;
        }

        public String gameDir() {
                return gameDir;
        }

        public String assetsDir() {
                return assetsDir;
        }

        public String resourcePackDir() {
                return resourcePackDir;
        }

        public String assetIndex() {
                return assetIndex;
        }

        public String versionType() {
                return versionType;
        }

        public String server() {
                return server;
        }

        public int port() {
                return port;
        }

        @Override
        public boolean equals(Object other) {
                if (this == other) {
                        return true;
                }
                if (!(other instanceof BrowserLaunchConfig)) {
                        return false;
                }
                BrowserLaunchConfig that = (BrowserLaunchConfig) other;
                return demo == that.demo
                                && fullscreen == that.fullscreen
                                && checkGlErrors == that.checkGlErrors
                                && width == that.width
                                && height == that.height
                                && port == that.port
                                && Objects.equals(username, that.username)
                                && Objects.equals(uuid, that.uuid)
                                && Objects.equals(version, that.version)
                                && Objects.equals(accessToken, that.accessToken)
                                && Objects.equals(gameDir, that.gameDir)
                                && Objects.equals(assetsDir, that.assetsDir)
                                && Objects.equals(resourcePackDir, that.resourcePackDir)
                                && Objects.equals(assetIndex, that.assetIndex)
                                && Objects.equals(versionType, that.versionType)
                                && Objects.equals(server, that.server);
        }

        @Override
        public int hashCode() {
                return Objects.hash(
                                demo,
                                fullscreen,
                                checkGlErrors,
                                width,
                                height,
                                username,
                                uuid,
                                version,
                                accessToken,
                                gameDir,
                                assetsDir,
                                resourcePackDir,
                                assetIndex,
                                versionType,
                                server,
                                port);
        }

        @Override
        public String toString() {
                return "BrowserLaunchConfig["
                                + "demo=" + demo
                                + ", fullscreen=" + fullscreen
                                + ", checkGlErrors=" + checkGlErrors
                                + ", width=" + width
                                + ", height=" + height
                                + ", username=" + username
                                + ", uuid=" + uuid
                                + ", version=" + version
                                + ", accessToken=" + accessToken
                                + ", gameDir=" + gameDir
                                + ", assetsDir=" + assetsDir
                                + ", resourcePackDir=" + resourcePackDir
                                + ", assetIndex=" + assetIndex
                                + ", versionType=" + versionType
                                + ", server=" + server
                                + ", port=" + port
                                + ']';
        }
}