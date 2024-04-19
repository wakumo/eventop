import { ethers } from "ethers";

export class JsonRpcClient {
  private nodeUrl: string;
  private myHeaders = new Headers({ "Content-Type": "application/json" });

  constructor(nodeUrl: string) {
    this.nodeUrl = nodeUrl;
  }

  async getTraceBlock(blockNo: number) {
    const blockNoInHex = ethers.BigNumber.from(blockNo).toHexString().replace('0x0', '0x');
    const requestPayload = this.requestPayload("trace_block", [blockNoInHex], blockNo);
    return await this.request(requestPayload);
  }

  private async request(requestPayload: any) {
    const requestOptions = { method: 'POST', headers: this.myHeaders, body: requestPayload, redirect: "follow" as RequestRedirect };
    const responses = await fetch(this.nodeUrl, requestOptions);
    const responseBody = await responses.json();

    return responseBody.result;
  }

  private requestPayload(method: string, params?: [any], requestId?: number) {
    const id = requestId ?? Math.floor(Math.random() * 1000000);
    return JSON.stringify(
      { "jsonrpc":"2.0","method":method,"params":params, "id": id },
    );
  }
}
