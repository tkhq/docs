import * as assert from "assert";
import { matchVersionedComponents } from "../utils/endpoint-parser/parser";

console.log("Running parser logic tests...");

// Test matchVersionedComponents with single version
const v1 = matchVersionedComponents(
  ["ACTIVITY_TYPE_CREATE_PRIVATE_KEYS"],
  ["createPrivateKeysIntent"],
  ["createPrivateKeysResult"]
);
assert.strictEqual(v1.length, 1);
assert.strictEqual(v1[0].version, "1");
assert.strictEqual(v1[0].intentName, "createPrivateKeysIntent");
assert.strictEqual(v1[0].resultName, "createPrivateKeysResult");
console.log("✓ matchVersionedComponents (v1) passed");

// Test matchVersionedComponents with multiple versions
const v2 = matchVersionedComponents(
  ["ACTIVITY_TYPE_CREATE_PRIVATE_KEYS", "ACTIVITY_TYPE_CREATE_PRIVATE_KEYS_V2"],
  ["createPrivateKeysIntent", "createPrivateKeysIntentV2"],
  ["createPrivateKeysResult", "createPrivateKeysResultV2"]
);
// Current implementation of matchVersionedComponents only returns ONE latest version
assert.strictEqual(v2.length, 1);
assert.strictEqual(v2[0].version, "2");
assert.strictEqual(v2[0].intentName, "createPrivateKeysIntentV2");
assert.strictEqual(v2[0].resultName, "createPrivateKeysResultV2");
console.log("✓ matchVersionedComponents (v2 latest) passed");

// Test matchVersionedComponents with missing result (fallback logic)
const vFallback = matchVersionedComponents(
  ["ACTIVITY_TYPE_CREATE_PRIVATE_KEYS"],
  ["createPrivateKeysIntent"],
  []
);
assert.strictEqual(vFallback.length, 1);
assert.strictEqual(vFallback[0].resultName, "createPrivateKeysResult");
console.log("✓ matchVersionedComponents (fallback result) passed");

console.log("All parser logic tests passed!");
