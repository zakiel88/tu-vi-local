// native.js — cầu nối Capacitor duy nhất. Web thuần: isNative=false, mọi hàm no-op an toàn.
(function () {
  const cap = window.Capacitor;
  const isNative = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  const P = (name) => (cap && cap.Plugins && cap.Plugins[name]) || null;

  async function writeCache(filename, base64Data) {
    const fs = P("Filesystem");
    const res = await fs.writeFile({ path: filename, data: base64Data, directory: "CACHE" });
    return res.uri;
  }

  window.TuViNative = {
    isNative,
    async sharePNGDataUrl(dataUrl, filename) {
      const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
      const uri = await writeCache(filename, base64);
      await P("Share").share({ title: filename, files: [uri] });
    },
    async shareText(text, filename) {
      const base64 = btoa(unescape(encodeURIComponent(text)));
      const uri = await writeCache(filename, base64);
      await P("Share").share({ title: filename, files: [uri] });
    },
    async hapticMedium() {
      try { if (isNative) await P("Haptics").impact({ style: "MEDIUM" }); } catch {}
    },
    async hapticLight() {
      try { if (isNative) await P("Haptics").impact({ style: "LIGHT" }); } catch {}
    },
    async hapticSelection() {
      try { if (isNative) await P("Haptics").selectionStart(); } catch {}
    },
  };
})();
