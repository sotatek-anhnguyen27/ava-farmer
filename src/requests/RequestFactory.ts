const instances = {};

export default class RequestFactory {
  static getRequest(classname: any) {
    // @ts-ignore
    const RequestClass = requestMap[classname];
    if (!RequestClass) {
      throw new Error(`Invalid request class name: ${classname}`);
    }

    // @ts-ignore
    let requestInstance = instances[classname];
    if (!requestInstance) {
      requestInstance = new RequestClass();
      // @ts-ignore
      instances[classname] = requestInstance;
    }

    return requestInstance;
  }
}
