const { text, fail } = require("./validation");
function link(value, name, github = false) {
  const input = text(value, name, 0, 500);
  if (!input) return "";
  let url;
  try {
    url = new URL(input);
  } catch {
    fail(`${name} must be a complete HTTPS link`);
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !url.hostname.includes(".")
  )
    fail(`${name} must be a complete HTTPS link without credentials`);
  if (github && !["github.com", "www.github.com"].includes(url.hostname))
    fail("Use a github.com profile link");
  return url.href;
}
function showcase(body) {
  const data = {};
  if (body.headline !== undefined)
    data.headline = text(body.headline, "Headline", 0, 120);
  for (const key of ["portfolioUrl", "resumeUrl", "githubUrl", "linkedinUrl"])
    if (body[key] !== undefined)
      data[key] = link(body[key], key, key === "githubUrl");
  for (const key of ["achievements", "projects"]) {
    if (body[key] === undefined) continue;
    if (!Array.isArray(body[key]) || body[key].length > 8)
      fail(`Add up to 8 ${key}`);
    data[key] = body[key].map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item))
        fail(`Invalid ${key} entry`);
      const result = {
        title: text(item.title, "Title", 2, 120),
        url: link(item.url ?? "", "Evidence link"),
      };
      if (key === "projects") {
        result.description = text(
          item.description ?? "",
          "Project description",
          0,
          600,
        );
        if (!result.url) fail("Add a project link");
      } else {
        result.issuer = text(item.issuer ?? "", "Issuer", 0, 120);
        result.year = text(item.year ?? "", "Year", 0, 4);
        if (result.year && !/^(19|20)\d{2}$/.test(result.year))
          fail("Use a four-digit achievement year");
      }
      return result;
    });
  }
  return data;
}
module.exports = { link, showcase };
