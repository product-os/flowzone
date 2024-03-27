const fs = require("fs");
const yaml = require("yaml");

// Using yaml.parse means that anything not supported by json will be dropped, in practice
// this means that yaml anchors will be "exploded" and not present in the github workflow
// we write out, which means we can use anchors when developing flowzone but not have to
// worry about github actions not supporting them
const flowzone = yaml.parse(fs.readFileSync("./flowzone.yml", "utf8"), {
	merge: true,
});
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

function injectYamlIntoMarkdown(startTag, endTag) {
	const yamlFilePath = ".github/workflows/flowzone.yml";
	const markdownFilePath = "README.md";

	// Read the YAML file
	const yamlContents = fs.readFileSync(yamlFilePath, "utf8");

	// Parse the YAML contents
	const yamlData = yaml.parse(yamlContents);

	// Generate the injected YAML code
	let injectedYamlCode = `
name: Flowzone

on:
  pull_request:
    types: [opened, synchronize, closed]
    branches: [main, master]
  # allow external contributions to use secrets within trusted code
  pull_request_target:
    types: [opened, synchronize, closed]
    branches: [main, master]

jobs:
  flowzone:
    name: Flowzone
    uses: product-os/flowzone/.github/workflows/flowzone.yml@master
    # prevent duplicate workflow executions for pull_request and pull_request_target
    if: |
      (
        github.event.pull_request.head.repo.full_name == github.repository &&
        github.event_name == 'pull_request'
      ) || (
        github.event.pull_request.head.repo.full_name != github.repository &&
        github.event_name == 'pull_request_target'
      )

    # Workflows in the same org or enterprise can use the inherit keyword to implicitly pass secrets
    secrets: inherit

    # Otherwise you must manually specify which secrets to pass
`;

	// Function to handle multiline comments
	function formatMultilineComment(value, wrapLength = 90) {
		// Convert value to a string if it's not already
		let valueStr = typeof value === "string" ? value : JSON.stringify(value);

		// Trim whitespace from the start and end of the value
		valueStr = valueStr.trim();

		// Check if the value is a multiline string
		const isMultiline = valueStr.includes("\n");

		// Split multiline strings and prepend each line with a comment sign and spaces
		const valueLines = valueStr.split("\n");
		let formattedComment = "";

		valueLines.forEach((line, _) => {
			let prefix = isMultiline ? `# ` : `# `;
			const wrappedPrefix = `# `;

			// Break long comments into chunks
			const words = line.split(" ");
			let commentLine = "";
			for (const word of words) {
				if (commentLine.length + word.length <= wrapLength) {
					commentLine += word + " ";
				} else {
					formattedComment += `      ${prefix}${commentLine.trim()}\n`;
					commentLine = word + " ";
					// Reset the prefix to the wrapped version without label
					prefix = wrappedPrefix;
				}
			}

			// Add the remaining words
			if (commentLine.trim().length > 0) {
				formattedComment += `      ${prefix}${commentLine.trim()}\n`;
			}
		});

		return formattedComment;
	}

	// Function to handle multiline strings
	function formatMultilineString(value) {
		// Convert value to a string if it's not already
		let valueStr = typeof value === "string" ? value : JSON.stringify(value);

		// Trim whitespace from the start and end of the value
		valueStr = valueStr.trim();

		// Check if the value is a multiline string
		const isMultiline = valueStr.includes("\n");

		// If it's a multiline string, use the folded block syntax, otherwise return the string as is
		return isMultiline
			? `>\n        ${valueStr.split("\n").join("\n        ")}`
			: valueStr;
	}

	// Convert secrets to structs in YAML
	const secrets = yamlData.on.workflow_call.secrets;
	if (secrets) {
		injectedYamlCode += `    secrets:\n`;
		Object.keys(secrets).forEach((key) => {
			const { description, required } = secrets[key];
			if (description != null) {
				injectedYamlCode += formatMultilineComment(description);
			}
			if (required != null) {
				injectedYamlCode += `      # Required: ${required}\n`;
			}
			injectedYamlCode += `      ${key}:\n\n`;
		});
	}

	// Convert inputs to structs in YAML
	const inputs = yamlData.on.workflow_call.inputs;
	if (inputs) {
		injectedYamlCode += `    with:\n`;
		Object.keys(inputs).forEach((key) => {
			const {
				description,
				type,
				default: defaultValue,
				required,
			} = inputs[key];
			if (description != null) {
				injectedYamlCode += formatMultilineComment(description);
			}
			if (type != null) {
				injectedYamlCode += `      # Type: ${type}\n`;
			}
			if (required != null) {
				injectedYamlCode += `      # Required: ${required}\n`;
			}
			if (defaultValue != null) {
				const formattedDefaultValue = formatMultilineString(defaultValue);
				injectedYamlCode += `      ${key}: ${formattedDefaultValue}\n\n`;
			} else {
				injectedYamlCode += `      ${key}:\n\n`;
			}
		});
	}

	// Read the Markdown file
	let markdownContents = fs.readFileSync(markdownFilePath, "utf8");

	// Find the start and end positions of the tags
	const startIndex = markdownContents.indexOf(startTag);
	const endIndex = markdownContents.indexOf(endTag);

	// If the start and end tags are found
	if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
		// Replace the content between the tags with the injected YAML code
		markdownContents =
			markdownContents.slice(0, startIndex + startTag.length) +
			"\n\n<!---\n" +
			"DO NOT EDIT MANUALLY - This section is auto-generated from flowzone.yml\n" +
			"-->\n\n```yaml\n" +
			injectedYamlCode +
			"\n```\n" +
			markdownContents.slice(endIndex);

		// Write the modified content back to the Markdown file
		fs.writeFileSync(markdownFilePath, markdownContents, "utf8");
	} else {
		console.log("Start and/or end tags not found in the Markdown file.");
	}
}

injectYamlIntoMarkdown("<!-- start usage -->", "<!-- end usage -->");
