const assert = require("assert");
const fs = require("fs");
const yaml = require("yaml");

let flowzoneSource = fs.readFileSync("./flowzone.yml", "utf8");

// Pattern to find template variables (sub lines with file)
const templateVariable = (p) => {
  // Tab or spaced comment with curly braces enclosing a variable
  return new RegExp(`[ \t]*# {{ *${p} *}}`, "g");
};
const fileTemplate = (p = "(.*[a-zA-Z0-9/_-]+.yml)") => {
  return templateVariable(p);
};
const matches = flowzoneSource.matchAll(fileTemplate());
if (matches) {
  // Replace any template variables before passing to yaml exploder
  for (const m of matches) {
    const entireLine = m[0];
    const spacing = entireLine.substring(0, entireLine.indexOf("#"));
    const templateValue = fs.readFileSync(m[1], "utf8");
    const sub =
      spacing.length > 0 // Adding template tabs/spaces to template source for proper indenting
        ? tabText(templateValue, spacing.length)
        : templateValue;
    flowzoneSource = flowzoneSource.replaceAll(fileTemplate(m[1]), sub);
  }
}

function tabText(text, numOfTabs) {
  const lines = text.split("\n");
  return lines
    .map((l) => {
      return tabs(numOfTabs) + l;
    })
    .join("\n");
  function tabs(n, tabReturn = "") {
    if (n !== 0) {
      return tabs(n - 1, tabReturn + " ");
    }
    return tabReturn + " ";
  }
}

// Using yaml.parse means that anything not supported by json will be dropped, in practice
// this means that yaml anchors will be "exploded" and not present in the github workflow
// we write out, which means we can use anchors when developing flowzone but not have to
// worry about github actions not supporting them
const flowzone = yaml.parse(flowzoneSource);
delete flowzone[".flowzone"];
fs.writeFileSync(
  "./.github/workflows/flowzone.yml",
  "# DO NOT EDIT MANUALLY - This file is auto-generated from `/flowzone.yml`\n" +
    yaml.stringify(flowzone, {
      // Disable aliasing of duplicate objects to ensure none of the anchors are
      // auto-detected and added back into the output file
      aliasDuplicateObjects: false,
      // Disable line-wrapping, it looks very confusing to have embedded scripts be
      // line-wrapped and will be a red herring if we ever need to debug
      lineWidth: 0,
    })
);
