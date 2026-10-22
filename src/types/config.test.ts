import { festivalConfig, normalConfig } from "../api/mock/configs";
import { homeSectionSchema, layoutConfigSchema, parseOrThrow } from "./config";

const validTheme = normalConfig.theme;

describe("layout config schema", () => {
  it("accepts both configs the mock server ships", () => {
    for (const config of [normalConfig, festivalConfig]) {
      expect(() => parseOrThrow(layoutConfigSchema, config, "config")).not.toThrow();
    }
  });

  it("keeps section types this build has never seen", () => {
    const parsed = parseOrThrow(
      layoutConfigSchema,
      {
        version: 9,
        theme: validTheme,
        tabs: [],
        sections: [
          {
            id: "section-from-the-future",
            type: "scratch_card",
            background: { kind: "color", value: validTheme.surface },
            items: [{ id: "anything" }],
          },
        ],
      },
      "config",
    );

    // The schema must not reject unknown types: the renderer decides to skip
    // them, so one new server section can never blank the whole home screen.
    expect(parsed.sections).toHaveLength(1);
    expect(parsed.sections[0]?.type).toBe("scratch_card");
  });

  it("defaults optional fields instead of crashing the renderer", () => {
    const section = parseOrThrow(
      homeSectionSchema,
      { id: "bare", type: "offer_strip", background: { kind: "color", value: "#FFFFFF" } },
      "section",
    );

    expect(section.title).toBe("");
    expect(section.items).toEqual([]);
  });

  it("rejects a payload that is missing required theme tokens", () => {
    expect(() =>
      parseOrThrow(
        layoutConfigSchema,
        { version: 1, theme: { primary: "#0F766E" }, sections: [] },
        "config",
      ),
    ).toThrow(/Invalid config/);
  });

  it("rejects an unknown background kind", () => {
    expect(() =>
      parseOrThrow(
        layoutConfigSchema,
        {
          version: 1,
          theme: validTheme,
          sections: [
            { id: "bad", type: "offer_strip", background: { kind: "video", value: "x" } },
          ],
        },
        "config",
      ),
    ).toThrow(/background\.kind/);
  });
});
