import * as assert from "assert";
import {
  snakeToCamel,
  extractEndpointName,
  determineEndpointType,
  extractVersionFromComponent,
  createIntentBaseName,
} from "../utils/endpoint-parser/string-utils";

console.log("Running string-utils tests...");

// Test snakeToCamel
assert.strictEqual(snakeToCamel("create_private_keys"), "createPrivateKeys");
assert.strictEqual(snakeToCamel("whoami"), "whoami");
console.log("✓ snakeToCamel passed");

// Test extractEndpointName
assert.strictEqual(
  extractEndpointName("/public/v1/submit/create_private_keys"),
  "create_private_keys"
);
console.log("✓ extractEndpointName passed");

// Test determineEndpointType
assert.strictEqual(
  determineEndpointType("/public/v1/submit/create_private_keys"),
  "activity"
);
assert.strictEqual(
  determineEndpointType("/public/v1/query/whoami"),
  "query"
);
assert.strictEqual(determineEndpointType("/v1/account"), "query");
console.log("✓ determineEndpointType passed");

// Test extractVersionFromComponent
assert.strictEqual(extractVersionFromComponent("createPrivateKeysIntent"), "1");
assert.strictEqual(extractVersionFromComponent("createPrivateKeysIntentV2"), "2");
console.log("✓ extractVersionFromComponent passed");

// Test createIntentBaseName
assert.strictEqual(
  createIntentBaseName("create_private_keys"),
  "createPrivateKeysIntent"
);
console.log("✓ createIntentBaseName passed");

console.log("All string-utils tests passed!");
