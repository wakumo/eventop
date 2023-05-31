// Monkey Patching toJson function of BigInt to support JSON.stringify
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

export {}