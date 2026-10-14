import { describe, expect, test } from "vitest";
import { hostOf, resourcesFor } from "@/lib/learning-resources";

describe("resourcesFor", () => {
  test("kỹ năng có trong danh sách trả tài liệu chính thức", () => {
    expect(resourcesFor("Docker").docs[0].url).toBe("https://docs.docker.com/get-started/");
  });

  test("cách viết khác nhau của cùng một kỹ năng dùng chung tài liệu", () => {
    expect(resourcesFor("Golang").docs).toEqual(resourcesFor("Go").docs);
    expect(resourcesFor("C#").docs).toEqual(resourcesFor(".NET").docs);
  });

  test("kỹ năng lạ không có tài liệu bịa, chỉ có link tìm kiếm", () => {
    const result = resourcesFor("Misa");
    expect(result.docs).toEqual([]);
    expect(result.searchUrl).toContain("google.com/search?q=Misa");
  });
});

describe("hostOf", () => {
  test("bỏ www.", () => {
    expect(hostOf("https://www.postgresql.org/docs/")).toBe("postgresql.org");
  });
});
