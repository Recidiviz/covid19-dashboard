import firebase from "firebase";
import mapObject from "map-obj";

import { EpidemicModelPersistent } from "../impact-dashboard/EpidemicModelContext";

const undefinedString = "undefined";

export const prepareForStorage = (state: EpidemicModelPersistent): object => {
  return mapObject(
    state,
    (key, value) => {
      if (value === undefinedString) {
        throw new Error(`The string '${undefinedString}' cannot be persisted`);
      }

      return [key, value === undefined ? undefinedString : value];
    },
    { deep: true },
  );
};

export const prepareFromStorage = (state: object): EpidemicModelPersistent => {
  return mapObject(
    state,
    (key, value) => [key, value === undefinedString ? undefined : value],
    { deep: true },
  );
};

type BatchOperationType = "CREATE" | "DELETE" | "SET" | "UPDATE";
type BatchOperationParams = [
  firebase.firestore.DocumentReference<firebase.firestore.DocumentData>,
  firebase.firestore.DocumentData,
  // add other option types when implemented
  firebase.firestore.SetOptions | undefined,
];
type BatchOperation = {
  type: BatchOperationType;
  params: BatchOperationParams;
};

/**
 * Wrapper around firebase.firestore.WriteBatch that abstracts away the batch size limit.
 * Exposes methods and properties that would result in batch operations.
 * Automatically chunks the batch when it's full to prevent overflows.
 */
export class BatchWriter {
  private client: firebase.firestore.Firestore;
  private currentBatch!: BatchOperation[];
  // a single "write" can trigger additional operations (in effect,
  // incrementing the batch size by >1); track them here to anticipate
  // and prevent overflows
  private currentBatchSize = 0;
  // this limit is imposed by Firestore
  readonly MAX_BATCH_SIZE = 500;
  private operationBatches: BatchOperation[][] = [];
  private pendingOpsCount = 0;

  constructor(client: firebase.firestore.Firestore) {
    this.client = client;
    this.startBatch();
  }

  private startBatch() {
    const newBatch: BatchOperation[] = [];
    this.currentBatch = newBatch;
    this.operationBatches.push(newBatch);
  }

  private trackWrite() {
    this.currentBatchSize += 1 + this.pendingOpsCount;
    this.pendingOpsCount = 0;
  }

  private preventOverflow() {
    if (this.currentBatchSize + this.pendingOpsCount >= this.MAX_BATCH_SIZE) {
      this.startBatch();
    }
  }

  // NOTE: can also mirror other server transform operations as needed
  get serverTimestamp() {
    this.pendingOpsCount += 1;
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  // NOTE: can also mirror create, delete, update methods on batch as needed
  set(
    ref: BatchOperationParams[0],
    data: BatchOperationParams[1],
    options?: firebase.firestore.SetOptions,
  ) {
    this.preventOverflow();
    this.currentBatch.push({
      type: "SET",
      params: [ref, data, options],
    });
    this.trackWrite();
    // mimic Firestore interface, allows for chained method calls
    return this;
  }

  async commit() {
    await Promise.all(
      this.operationBatches.map((operationBatch) => {
        const writeBatch = this.client.batch();
        operationBatch.forEach(({ type, params: [ref, data, options] }) => {
          switch (type) {
            case "SET":
              writeBatch.set(ref, data, options);
              break;
            // add other methods here as they are implemented
          }
        });
        return writeBatch.commit();
      }),
    );
  }
}
