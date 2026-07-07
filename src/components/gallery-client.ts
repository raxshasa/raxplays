const imageImports = {
  ...import.meta.glob("/src/assets/images/**/*.{png,jpg,jpeg,webp,avif}", {
    eager: true,
    query: "?url",
    import: "default",
  }),
  ...import.meta.glob("/src/data/blog/**/*.{png,jpg,jpeg,webp,avif}", {
    eager: true,
    query: "?url",
    import: "default",
  }),
} as Record<string, string>;

const imageFiles = Object.entries(imageImports).map(([path, url]) => ({
  path: path.replace(/\\/g, "/").replace(/^\/+/, ""),
  url,
}));

function normalizeFolder(folder?: string) {
  if (!folder) return null;
  let cleaned = String(folder).trim().replace(/\\/g, "/");
  cleaned = cleaned.replace(/^\.+\//, "").replace(/^\//, "");

  if (cleaned.startsWith("src/")) {
    return cleaned;
  }

  if (cleaned.startsWith("assets/")) {
    return `src/${cleaned}`;
  }

  if (cleaned.startsWith("data/")) {
    return `src/${cleaned}`;
  }

  return `src/assets/images/${cleaned}`;
}

function findGalleryImages(folder: string) {
  const normalized = normalizeFolder(folder);
  if (!normalized) return [];

  const prefix = normalized.endsWith("/") ? normalized : `${normalized}/`;
  const matches = imageFiles
    .filter(entry => entry.path.startsWith(prefix))
    .sort((a, b) => a.path.localeCompare(b.path));

  return matches.map(entry => entry.url);
}

function injectGalleryStyles() {
  if (document.getElementById("gallery-widget-styles")) return;

  const style = document.createElement("style");
  style.id = "gallery-widget-styles";
  style.textContent = `
    .gallery-widget { position: relative; margin: 0.9rem 0; }
    .gallery-grid { position: relative; display: grid; grid-template-columns: 70% 30%; gap: 0; align-items: stretch; overflow: hidden; border-radius: 1.25rem; background: transparent; }
    .gallery-main, .gallery-thumbs { position: relative; display: grid; width: 100%; min-height: 0; }
    .gallery-main { overflow: hidden; background: transparent; border-radius: 1.25rem 0 0 1.25rem; }
    .gallery-main-button, .gallery-thumb { display: block; width: 100%; height: 100%; border: 0; padding: 0; margin: 0; background: transparent; cursor: pointer; color: inherit; text-align: inherit; min-height: 0; outline: none; }
    .gallery-main img, .gallery-thumb img { display: block; width: 100%; height: 100%; object-fit: cover; min-height: 0; -webkit-backface-visibility: hidden; backface-visibility: hidden; }
    .gallery-thumbs { display: flex; flex-direction: column; gap: 0; height: 100%; overflow: hidden; border-radius: 0 1.25rem 1.25rem 0; }
    .gallery-thumb { overflow: hidden; flex: 1 1 0; display: block; }
    .gallery-thumb-top { }
    .gallery-thumb-bottom { }
    .gallery-thumb-top img { border-top-right-radius: 1.25rem; display:block; border:0; margin:0; padding:0; }
    .gallery-thumb-bottom img { border-bottom-right-radius: 1.25rem; display:block; border:0; margin:0; padding:0; }
    .gallery-main img { border-radius: 1.25rem 0 0 1.25rem; display:block; border:0; margin:0; padding:0; }
    .gallery-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 3rem; height: 3rem; border-radius: 999px; border: 0; background: rgba(0, 0, 0, 0.64); color: #fff; font-size: 1.25rem; display: grid; place-items: center; cursor: pointer; z-index: 999; box-shadow: 0 18px 40px rgba(0, 0, 0, 0.36); transition: transform 0.16s ease, opacity 0.16s ease; }
    .gallery-arrow:hover { transform: translateY(-50%) scale(1.05); }
    .gallery-arrow-left { left: 0.75rem; }
    .gallery-arrow-right { right: 0.75rem; }
    .gallery-footer { margin-top: 0.75rem; text-align: right; font-size: 0.95rem; color: rgba(255,255,255,0.68); }
    .gallery-modal { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 1.5rem; background: rgba(0,0,0,0.75); opacity: 0; pointer-events: none; transition: opacity 0.2s ease; z-index: 9999; }
    .gallery-modal-open { opacity: 1; pointer-events: auto; }
    .gallery-modal-backdrop { position: absolute; inset: 0; }
    .gallery-modal-frame { position: relative; max-width: min(92vw, 1200px); max-height: min(92vh, 900px); width: 100%; z-index: 1; }
    .gallery-modal-image { width: 100%; height: auto; max-height: 90vh; border-radius: 1.25rem; box-shadow: 0 40px 120px rgba(0,0,0,0.25); }
    .gallery-modal-close { position: absolute; right: -0.75rem; top: -0.75rem; width: 2.5rem; height: 2.5rem; border: none; border-radius: 999px; background: rgba(255,255,255,0.94); color: #111; font-size: 1.5rem; line-height: 1; cursor: pointer; display: grid; place-items: center; }
    @media (max-width: 900px) { .gallery-grid { grid-template-columns: 1fr; } .gallery-thumbs { grid-template-columns: 1fr 1fr; grid-template-rows: auto; } }
    @media (max-width: 640px) { .gallery-grid { gap: 0.75rem; } .gallery-thumbs { grid-template-columns: 1fr; } }
    `;
  document.head.appendChild(style);
}

function createImg(src: string, alt: string) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.loading = "lazy";
  img.decoding = "async";
  return img;
}

function createButton(className: string, ariaLabel: string) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.setAttribute("aria-label", ariaLabel);
  return button;
}

function mountGallery(element: HTMLElement, images: string[]) {
  if (images.length < 3) {
    element.remove();
    return;
  }

  injectGalleryStyles();

  let currentIndex = 0;
  const total = images.length;

  const wrapper = document.createElement("div");
  wrapper.className = "gallery-widget";

  const grid = document.createElement("div");
  grid.className = "gallery-grid";

  const arrowLeft = createButton(
    "gallery-arrow gallery-arrow-left",
    "Previous gallery image"
  );
  arrowLeft.textContent = "‹";
  const arrowRight = createButton(
    "gallery-arrow gallery-arrow-right",
    "Next gallery image"
  );
  arrowRight.textContent = "›";

  const main = document.createElement("div");
  main.className = "gallery-main";
  const mainButton = createButton(
    "gallery-main-button",
    "Open gallery image in fullscreen"
  );
  const mainImg = createImg(
    images[currentIndex],
    `Gallery image ${currentIndex + 1} of ${total}`
  );
  mainBtnAppend();

  function mainBtnAppend() {
    mainButton.innerHTML = "";
    mainButton.appendChild(mainImg);
  }

  const thumbs = document.createElement("div");
  thumbs.className = "gallery-thumbs";
  const thumbTop = createButton(
    "gallery-thumb gallery-thumb-top",
    `Next gallery image 2 of ${total}`
  );
  const thumbBottom = createButton(
    "gallery-thumb gallery-thumb-bottom",
    `Next gallery image 3 of ${total}`
  );
  const thumbTopImg = createImg(images[1], `Next gallery image 2 of ${total}`);
  const thumbBottomImg = createImg(
    images[2],
    `Next gallery image 3 of ${total}`
  );
  thumbTop.appendChild(thumbTopImg);
  thumbBottom.appendChild(thumbBottomImg);

  main.appendChild(mainButton);
  grid.appendChild(main);
  grid.appendChild(thumbs);
  thumbs.appendChild(thumbTop);
  thumbs.appendChild(thumbBottom);

  const footer = document.createElement("div");
  footer.className = "gallery-footer";
  const counter = document.createElement("span");
  counter.className = "gallery-counter";
  footer.appendChild(counter);

  const modal = document.createElement("div");
  modal.className = "gallery-modal";
  modal.setAttribute("aria-hidden", "true");
  const modalBackdrop = document.createElement("div");
  modalBackdrop.className = "gallery-modal-backdrop";
  const modalFrame = document.createElement("div");
  modalFrame.className = "gallery-modal-frame";
  const modalClose = createButton("gallery-modal-close", "Close gallery modal");
  modalClose.textContent = "×";
  const modalImage = createImg(
    images[currentIndex],
    `Gallery image ${currentIndex + 1} of ${total}`
  );
  modalImage.className = "gallery-modal-image";
  modalFrame.appendChild(modalClose);
  modalFrame.appendChild(modalImage);
  modal.appendChild(modalBackdrop);
  modal.appendChild(modalFrame);

  wrapper.appendChild(grid);
  wrapper.appendChild(arrowLeft);
  wrapper.appendChild(arrowRight);
  wrapper.appendChild(footer);
  wrapper.appendChild(modal);

  function updateState(index: number) {
    currentIndex = ((index % total) + total) % total;
    const nextIndex = (currentIndex + 1) % total;
    const nextAfterIndex = (currentIndex + 2) % total;

    mainImg.src = images[currentIndex];
    mainImg.alt = `Gallery image ${currentIndex + 1} of ${total}`;
    modalImage.src = images[currentIndex];
    modalImage.alt = `Gallery image ${currentIndex + 1} of ${total}`;

    thumbTopImg.src = images[nextIndex];
    thumbTopImg.alt = `Gallery image ${nextIndex + 1} of ${total}`;
    thumbBottomImg.src = images[nextAfterIndex];
    thumbBottomImg.alt = `Gallery image ${nextAfterIndex + 1} of ${total}`;

    counter.textContent = `${currentIndex + 1} / ${total}`;
  }

  function openModal() {
    modal.removeAttribute("aria-hidden");
    modal.classList.add("gallery-modal-open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    modal.classList.remove("gallery-modal-open");
    document.body.style.overflow = "";
  }

  arrowLeft.addEventListener("click", () => updateState(currentIndex - 1));
  arrowRight.addEventListener("click", () => updateState(currentIndex + 1));
  thumbTop.addEventListener("click", () => updateState(currentIndex + 1));
  thumbBottom.addEventListener("click", () => updateState(currentIndex + 2));
  mainButton.addEventListener("click", openModal);
  modalClose.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  updateState(currentIndex);
  element.replaceWith(wrapper);
}

function mountGalleries() {
  const elements = Array.from(document.querySelectorAll("gallery"));
  if (!elements.length) return;

  for (const element of elements) {
    const folder = element.getAttribute("folder") || undefined;
    const images = folder ? findGalleryImages(folder) : [];
    mountGallery(element as HTMLElement, images);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountGalleries);
} else {
  mountGalleries();
}
