export class ShadowInjector {
  private static instance: ShadowInjector;
  private hostElement: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;

  private constructor() {}

  public static getInstance(): ShadowInjector {
    if (!ShadowInjector.instance) {
      ShadowInjector.instance = new ShadowInjector();
    }
    return ShadowInjector.instance;
  }

  /**
   * Mounts a custom element with an open Shadow DOM root onto host page body
   */
  public mountShadowContainer(id = "pramaan-shadow-host"): {
    container: HTMLElement;
    shadowRoot: ShadowRoot;
  } {
    let existingHost = document.getElementById(id);

    if (!existingHost) {
      existingHost = document.createElement("div");
      existingHost.id = id;
      existingHost.style.position = "fixed";
      existingHost.style.zIndex = "999990";
      existingHost.style.top = "0";
      existingHost.style.right = "0";
      existingHost.style.pointerEvents = "none";

      document.body.appendChild(existingHost);
    }

    if (!existingHost.shadowRoot) {
      this.shadowRoot = existingHost.attachShadow({ mode: "open" });
    } else {
      this.shadowRoot = existingHost.shadowRoot;
    }

    this.hostElement = existingHost;

    // Inject Tailwind/Global stylesheet into ShadowRoot for isolated styling
    this.injectStyles(this.shadowRoot);

    // Mount internal wrapper element
    let mountPoint = this.shadowRoot.querySelector<HTMLElement>("#pramaan-mount-point");
    if (!mountPoint) {
      mountPoint = document.createElement("div");
      mountPoint.id = "pramaan-mount-point";
      mountPoint.className = "pramaan-root font-sans";
      mountPoint.style.pointerEvents = "auto";
      this.shadowRoot.appendChild(mountPoint);
    }

    return {
      container: mountPoint,
      shadowRoot: this.shadowRoot
    };
  }

  private injectStyles(targetShadow: ShadowRoot): void {
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      :host {
        all: initial;
        font-family: 'Geist', 'Inter', system-ui, -apple-system, sans-serif;
      }
      * {
        box-sizing: border-box;
      }
      .pramaan-root {
        color: #FAFAFA;
      }
    `;
    targetShadow.appendChild(styleEl);
  }

  public unmount(): void {
    if (this.hostElement && this.hostElement.parentNode) {
      this.hostElement.parentNode.removeChild(this.hostElement);
    }
    this.hostElement = null;
    this.shadowRoot = null;
  }
}

export const shadowInjector = ShadowInjector.getInstance();
