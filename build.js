const fs = require("fs");
const yaml = require("yaml");

// Using yaml.parse means that anything not supported by json will be dropped, in practice
// this means that yaml anchors will be "exploded" and not present in the github workflow
// we write out, which means we can use anchors when developing flowzone but not have to
// worry about github actions not supporting them
const flowzone = yaml.parse(fs.readFileSync("./flowzone.yml", "utf8"));
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

const selfCertify = yaml.parse(fs.readFileSync("./self-certify.yml", "utf8"));
fs.writeFileSync(
	"./.github/workflows/self-certify.yml",
	"# DO NOT EDIT MANUALLY - This file is auto-generated from `/flowzone.yml`\n" +
	yaml.stringify(selfCertify, {
		// Disable aliasing of duplicate objects to ensure none of the anchors are
		// auto-detected and added back into the output file
		aliasDuplicateObjects: false,
		// Disable line-wrapping, it looks very confusing to have embedded scripts be
		// line-wrapped and will be a red herring if we ever need to debug
		lineWidth: 0,
	})
);
