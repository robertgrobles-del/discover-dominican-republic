import { beforeAll, describe, expect, it } from "vitest";
import { installAnonymousImages, shouldBeAnonymous } from "@/lib/anonymousImages";

describe("imágenes de Unsplash sin cookies de terceros", () => {
  beforeAll(() => installAnonymousImages());

  it("reconoce las URLs de Unsplash en src y srcset", () => {
    expect(shouldBeAnonymous("https://images.unsplash.com/photo-1?w=800")).toBe(true);
    expect(shouldBeAnonymous("/a.webp 1x, https://images.unsplash.com/photo-1?w=1600 2x")).toBe(true);
    expect(shouldBeAnonymous("https://www.descubrerepdom.com/api/v1/media/x.webp")).toBe(false);
  });

  it("marca crossorigin antes de asignar el src (por atributo y por propiedad)", () => {
    const a = document.createElement("img");
    a.setAttribute("src", "https://images.unsplash.com/photo-1?w=800");
    expect(a.getAttribute("crossorigin")).toBe("anonymous");

    const b = document.createElement("img");
    b.src = "https://images.unsplash.com/photo-2?w=800";
    expect(b.getAttribute("crossorigin")).toBe("anonymous");
  });

  it("no toca otras imágenes ni un crossorigin ya puesto", () => {
    const own = document.createElement("img");
    own.setAttribute("src", "/og-default.jpg");
    expect(own.hasAttribute("crossorigin")).toBe(false);

    const explicit = document.createElement("img");
    explicit.setAttribute("crossorigin", "use-credentials");
    explicit.setAttribute("src", "https://images.unsplash.com/photo-3");
    expect(explicit.getAttribute("crossorigin")).toBe("use-credentials");
  });
});
