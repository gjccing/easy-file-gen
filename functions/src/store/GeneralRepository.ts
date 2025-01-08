import * as admin from "firebase-admin";
import { LRUCache } from "lru-cache";
import {
  Timestamp,
  PartialWithFieldValue,
  CollectionReference,
} from "firebase-admin/firestore";

const db = admin.firestore();

export default class GeneralRepository<T extends Object> {
  collectionRef: CollectionReference;
  cacheIdToTask: LRUCache<string, T>;
  constructor(collection: string) {
    this.collectionRef = db.collection(collection);
    this.cacheIdToTask = new LRUCache<string, T>({
      ttl: 1000 * 10,
      ttlAutopurge: true,
      allowStale: false,
      updateAgeOnGet: false,
      updateAgeOnHas: false,
    });
  }
  async fetchById(id: string, forcedUpdate?: boolean): Promise<T | undefined> {
    if (this.cacheIdToTask.has(id) && !forcedUpdate) {
      return this.cacheIdToTask.get(id);
    } else {
      const snapshot = await this.collectionRef.doc(id).get();
      if (snapshot.exists) {
        const data = snapshot.data() as T;
        this.cacheIdToTask.set(id, data);
        return data;
      }
    }
    return;
  }
  async updateById(id: string, value: PartialWithFieldValue<T>) {
    await this.collectionRef.doc(id).update({
      editedAt: Timestamp.now(),
      ...(typeof value === "object" ? value : null),
    });
    this.cacheIdToTask.delete(id);
  }
  async setById(id: string, value: PartialWithFieldValue<T>) {
    const _value = Object.assign(
      {
        id,
        createdAt: Timestamp.now(),
        editedAt: Timestamp.now(),
      },
      value
    ) as T;
    await this.collectionRef.doc(id).set(_value);
    this.cacheIdToTask.set(id, _value);
    return _value;
  }
}
