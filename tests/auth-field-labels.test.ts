import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// WCAG 1.3.1, 2.4.6 and 3.3.2 on the auth and account forms. The only visible
// name of a field used to be its placeholder, and at 200 % text on a 320 px
// phone the placeholders were cut off inside the fields, so nobody could tell
// "Password" from "Confirm password". Every field now has a visible label
// above it, tied to it with htmlFor; a placeholder is only an example. The
// runtime proof (headless Chrome at 320 / 390 / 1440 px, 100-300 % text, page
// zoom and a 32 px minimum font size) is in
// yovoice-evidence/2026-09-25/website-labels.

const read = (path: string) => readFile(path, "utf8");

const AUTH_FORMS = [
  "src/components/auth/login-form.tsx",
  "src/components/auth/register-form.tsx",
  "src/components/auth/forgot-password-form.tsx",
  "src/components/auth/totp-challenge-form.tsx",
  "src/app/(auth)/reset-password/page.tsx",
];

// Every file that renders a text field for signing in, recovering or
// changing an account (the raw <input>s included).
const FIELD_FILES = [
  ...AUTH_FORMS,
  "src/components/ui/input.tsx",
  "src/components/auth/password-field.tsx",
  "src/app/(account)/account/security/page.tsx",
  "src/app/(account)/account/delete/page.tsx",
  "src/app/(account)/account/profile/page.tsx",
];

/** The JSX of every self-closing `<Tag … />` in a source file. Braces are
 * balanced, so an `icon={<Mail … />}` prop does not end the element. */
const elements = (source: string, tag: string) => {
  const found: string[] = [];
  for (const match of source.matchAll(new RegExp(`<${tag}\\b`, "g"))) {
    let depth = 0;
    for (let i = match.index + tag.length + 1; i < source.length; i += 1) {
      const ch = source[i];
      if (ch === "{") depth += 1;
      else if (ch === "}") depth -= 1;
      else if (depth === 0 && ch === "/" && source[i + 1] === ">") {
        found.push(source.slice(match.index, i + 2));
        break;
      }
    }
  }
  return found;
};

const stringProp = (element: string, prop: string) =>
  element.match(new RegExp(`\\s${prop}="([^"]*)"`))?.[1];

test("Input and PasswordField draw a visible label, tied to the input", async () => {
  const [input, password, css] = await Promise.all([
    read("src/components/ui/input.tsx"),
    read("src/components/auth/password-field.tsx"),
    read("src/app/globals.css"),
  ]);
  for (const [name, source] of [["Input", input], ["PasswordField", password]] as const) {
    // One label, visible, above the field, pointing at the input's id.
    assert.equal(source.match(/<label\b/g)?.length, 1, name);
    assert.match(source, /<label htmlFor=\{id\} className="field-label">\s*\{label\}\s*<\/label>/, name);
    assert.ok(source.indexOf("<label") < source.indexOf('className="glass-field"'), `${name}: label above the field`);
    assert.match(source, /\n\s+id=\{id\}\n/, name);
    assert.doesNotMatch(source, /sr-only/, name);
    // The label is a required prop, so no caller can leave a field unnamed.
    assert.match(source, /\n\s+label: string;\n/, name);
    assert.match(source, /\n\s+id: string;\n/, name);
  }
  // The placeholder is optional: an example, never the name.
  assert.match(password, /placeholder\?: string;/);

  // Visible and calm: a block of small secondary text, never visually hidden.
  const rule = css.match(/\n\.field-label \{([^}]*)\}/);
  assert.ok(rule, "missing .field-label");
  assert.match(rule[1], /display: block;/);
  assert.match(rule[1], /font-size: \.8125rem;/);
  assert.match(rule[1], /color: var\(--text-secondary\);/);
  // Unitless, so a raised minimum font size never overlaps a wrapped label.
  assert.match(rule[1], /line-height: 1\.5;/);
  assert.doesNotMatch(rule[1], /position|clip|opacity|visibility|overflow|white-space|text-overflow|text-transform/);
});

test("error and hint text stay linked to their field", async () => {
  const [input, password, reset, totp] = await Promise.all([
    read("src/components/ui/input.tsx"),
    read("src/components/auth/password-field.tsx"),
    read("src/app/(auth)/reset-password/page.tsx"),
    read("src/components/auth/totp-challenge-form.tsx"),
  ]);
  // Input keeps a caller's description and adds its own error message.
  assert.match(input, /\[describedBy, showError \? errorId : null\]/);
  assert.match(input, /aria-describedby=\{describedByIds\}\s*\{\.\.\.rest\}/);
  assert.match(input, /<p id=\{errorId\} role="alert"/);
  assert.match(password, /\[describedBy, invalid && errorMessage \? errorId : null\]/);
  assert.match(password, /aria-describedby=\{describedByIds\}/);
  assert.match(password, /<p id=\{errorId\} role="alert"/);
  // The reset page's "At least 8 characters" rule is read with the field.
  assert.match(reset, /describedBy="new-password-hint"/);
  assert.match(reset, /<p id="new-password-hint" className="mt-2 text-xs text-text-tertiary">\s*At least \{MIN_PASSWORD_LENGTH\} characters\./);
  // The TOTP step still describes the code field with its instructions and error.
  assert.match(totp, /aria-describedby=\{`\$\{descriptionId\}\$\{error \? ` \$\{errorId\}` : ""\}`\}/);
  // A mismatched confirmation says so in words, not only with a red border.
  const register = await read("src/components/auth/register-form.tsx");
  const confirm = elements(register, "Input").find((e) => e.includes('id="register-confirm-password"'));
  assert.ok(confirm);
  assert.match(confirm, /errorMessage="Passwords don't match yet\."/);
});

test("every auth input has a visible label, and no placeholder stands in for one", async () => {
  let fields = 0;
  for (const path of AUTH_FORMS) {
    const source = await read(path);
    assert.doesNotMatch(source, /className="sr-only"/, `${path}: no hidden field label`);
    for (const element of [...elements(source, "Input"), ...elements(source, "PasswordField")]) {
      fields += 1;
      const id = stringProp(element, "id");
      assert.ok(id, `${path}: every field has an id`);
      const label = stringProp(element, "label") ?? element.match(/\slabel=\{([^}]+)\}/)?.[1];
      assert.ok(label && label.trim().length > 0, `${path}: #${id} has a visible label`);
      const placeholder = stringProp(element, "placeholder");
      if (placeholder !== undefined) {
        assert.notEqual(placeholder.toLowerCase(), label.toLowerCase(), `${path}: #${id} placeholder repeats its label`);
      }
    }
  }
  // login 2, register 4, forgot 1, TOTP 1, reset 2.
  assert.equal(fields, 10);
});

test("every raw text input on the account forms has a visible <label htmlFor>", async () => {
  for (const path of FIELD_FILES) {
    const source = await read(path);
    for (const element of elements(source, "input")) {
      if (/type="(checkbox|radio|hidden)"/.test(element)) continue;
      const id = stringProp(element, "id") ?? element.match(/\sid=\{(\w+)\}/)?.[1];
      assert.ok(id, `${path}: an <input> without an id cannot have a label`);
      if (id === "id") continue; // Input / PasswordField: covered above.
      const htmlFor = new RegExp(`<label\\s+htmlFor=(?:"${id}"|\\{${id}\\})\\s+className="([^"]*)"`);
      const label = source.match(htmlFor);
      assert.ok(label, `${path}: #${id} has a <label htmlFor>`);
      assert.doesNotMatch(label[1], /sr-only/, `${path}: #${id} label is visible`);
      assert.doesNotMatch(element, /\saria-label=/, `${path}: #${id} is named by its visible label`);
    }
  }
});
