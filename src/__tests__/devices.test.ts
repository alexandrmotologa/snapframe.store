import { describe, it, expect } from "vitest";
import {
  ALL_DEVICES,
  IOS_DEVICES,
  ANDROID_DEVICES,
  isTabletDevice,
  COLOR_HEX_MAP,
  APP_STORE_SIZES,
} from "@/lib/devices";

describe("devices", () => {
  describe("device lists", () => {
    it("contains valid iOS devices", () => {
      expect(IOS_DEVICES.length).toBeGreaterThan(0);
      IOS_DEVICES.forEach((d) => {
        expect(d.store).toBe("ios");
        expect(d.width).toBeGreaterThan(0);
        expect(d.height).toBeGreaterThan(0);
        expect(d.colors.length).toBeGreaterThan(0);
      });
    });

    it("contains valid Android devices", () => {
      expect(ANDROID_DEVICES.length).toBeGreaterThan(0);
      ANDROID_DEVICES.forEach((d) => {
        expect(d.store).toBe("android");
        expect(d.width).toBeGreaterThan(0);
        expect(d.height).toBeGreaterThan(0);
        expect(d.colors.length).toBeGreaterThan(0);
      });
    });

    it("ALL_DEVICES combines iOS and Android without empty items", () => {
      expect(ALL_DEVICES.length).toBe(IOS_DEVICES.length + ANDROID_DEVICES.length);
    });
  });

  describe("isTabletDevice", () => {
    it("identifies iPads as tablet devices", () => {
      expect(isTabletDevice("ipad-pro-13")).toBe(true);
      expect(isTabletDevice("ipad-mini")).toBe(true);
    });

    it("identifies Android tablets as tablet devices", () => {
      expect(isTabletDevice("galaxy-tab-s9")).toBe(true);
      expect(isTabletDevice("pixel-tablet")).toBe(true);
    });

    it("identifies phones as non-tablet devices", () => {
      expect(isTabletDevice("iphone-16-pro-max")).toBe(false);
      expect(isTabletDevice("pixel-9-pro")).toBe(false);
      expect(isTabletDevice("galaxy-s24-ultra")).toBe(false);
    });

    it("returns false for undefined or null device", () => {
      expect(isTabletDevice(undefined)).toBe(false);
      expect(isTabletDevice(null)).toBe(false);
      expect(isTabletDevice("")).toBe(false);
    });
  });

  describe("COLOR_HEX_MAP", () => {
    it("maps common color names to valid hex strings", () => {
      const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
      expect(COLOR_HEX_MAP["black"]).toMatch(hexRegex);
      expect(COLOR_HEX_MAP["white"]).toMatch(hexRegex);
      expect(COLOR_HEX_MAP["natural titanium"]).toMatch(hexRegex);
      expect(COLOR_HEX_MAP["obsidian"]).toMatch(hexRegex);
    });
  });

  describe("APP_STORE_SIZES", () => {
    it("has size specifications for ios and android", () => {
      expect(APP_STORE_SIZES.ios.length).toBeGreaterThan(0);
      expect(APP_STORE_SIZES.android.length).toBeGreaterThan(0);
    });
  });
});
