import firebase from "firebase/app";
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

type BatchOperationData = firebase.firestore.DocumentData;
type BatchOperationRef = firebase.firestore.DocumentReference<
  BatchOperationData
>;
type BatchDelete = {
  type: "DELETE";
  params: { ref: BatchOperationRef };
};
type BatchUpdate = {
  type: "UPDATE";
  params: { ref: BatchOperationRef; data: BatchOperationData };
};
type BatchSet = {
  type: "SET";
  params: {
    ref: BatchOperationRef;
    data: BatchOperationData;
    options?: firebase.firestore.SetOptions;
  };
};
type BatchOperation = BatchDelete | BatchSet | BatchUpdate;

/**
 * Wrapper around firebase.firestore.WriteBatch that abstracts away the batch size limit.
 * Exposes methods and properties that would result in batch operations.
 * Automatically chunks the batch when it's full to prevent overflows.
 *
 * NOTE: Successful use of this class requires that the write method is called
 * immediately after provisioning its pending ops (the server transformations), so
 * that the write and additional ops are guaranteed to be applied to the same batch.
 * If you don't follow this order (e.g. you prepare a number of documents that trigger
 * pending ops, then call all their write methods), the commit may fail because it will
 * apply all the pending ops to the first batch.
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
  serverDelete() {
    this.pendingOpsCount += 1;
    return firebase.firestore.FieldValue.delete();
  }

  serverTimestamp() {
    this.pendingOpsCount += 1;
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  // NOTE: create method not implemented, can add if it becomes needed

  delete(ref: BatchOperationRef) {
    this.preventOverflow();
    this.currentBatch.push({
      type: "DELETE",
      params: { ref },
    });
    this.trackWrite();
    // mimic Firestore interface, allows for chained method calls
    return this;
  }

  set(
    ref: BatchOperationRef,
    data: BatchOperationData,
    options?: firebase.firestore.SetOptions,
  ) {
    this.preventOverflow();
    this.currentBatch.push({
      type: "SET",
      params: { ref, data, options },
    });
    this.trackWrite();
    // mimic Firestore interface, allows for chained method calls
    return this;
  }

  update(ref: BatchOperationRef, data: BatchOperationData) {
    this.preventOverflow();
    this.currentBatch.push({
      type: "UPDATE",
      params: { ref, data },
    });
    this.trackWrite();
    // mimic Firestore interface, allows for chained method calls
    return this;
  }

  async commit() {
    await Promise.all(
      this.operationBatches.map((operationBatch) => {
        const writeBatch = this.client.batch();
        operationBatch.forEach((operation) => {
          switch (operation.type) {
            case "DELETE":
              writeBatch.delete(operation.params.ref);
              break;
            case "SET":
              writeBatch.set(
                operation.params.ref,
                operation.params.data,
                operation.params.options || {},
              );
              break;
            case "UPDATE":
              writeBatch.update(operation.params.ref, operation.params.data);
              break;
            default:
              console.error(
                // type assertion here because operation is technically a never
                // in the present implementation; this is mainly intended as a guardrail
                // for future implementations of additional write methods (e.g. CREATE)
                `Operation type ${
                  (operation as any).type
                } is unsupported; change will not be committed.`,
              );
              break;
          }
        });
        return writeBatch.commit();
      }),
    );
  }
}
